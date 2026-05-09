import type { TonePreset, Platform, Mode } from '@tonewise/agents';
import { toneOrchestrator } from '@tonewise/agents';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RewriteBody {
  message: string;
  preset: TonePreset;
  platform: Platform;
  mode?: Mode;
}

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '24 h'),
  analytics: true,
  prefix: 'tonewise',
});

export async function POST(req: Request): Promise<Response> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';

    const { success, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return Response.json(
        { error: 'Daily limit reached. Resets at ' + new Date(reset).toLocaleTimeString() },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        },
      );
    }

    const body = (await req.json()) as RewriteBody;

    if (!body.message?.trim()) {
      return Response.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (!body.preset) {
      return Response.json({ error: 'Tone preset is required.' }, { status: 400 });
    }
    if (!body.platform) {
      return Response.json({ error: 'Platform is required.' }, { status: 400 });
    }

    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      return Response.json(
        { error: 'Server configuration error: API key not set.' },
        { status: 500 },
      );
    }

    const result = await toneOrchestrator({
      message: body.message,
      preset: body.preset,
      platform: body.platform,
      mode: body.mode ?? 'quick',
    });

    return Response.json(result, {
      headers: {
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    });
  } catch (err) {
    console.error('/api/rewrite error:', err);
    return Response.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
