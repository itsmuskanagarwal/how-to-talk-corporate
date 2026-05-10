# @professional-message-writer/extension

Plasmo-based browser extension for Professional Message Writer. Targets Chrome MV3 and Firefox MV2.

## Develop

```bash
pnpm --filter @professional-message-writer/extension dev
```

Then load `apps/extension/build/chrome-mv3-dev` as an unpacked extension in Chrome.

## Phase ownership

P3 (week 7–8). The popup, content-script field detection, and floating Professional Message Writer button
are scaffolded as stubs and built out by the Frontend Architect in P3.

## Build for production

```bash
pnpm --filter @professional-message-writer/extension build         # Chrome MV3
pnpm --filter @professional-message-writer/extension build:firefox  # Firefox MV2
pnpm --filter @professional-message-writer/extension package        # Zips for store submission
```
