import type { ClarificationRequest } from '../types/index';

export async function clarificationAgent(_message: string): Promise<ClarificationRequest> {
  // Strict contract: never returns more than 2 questions.
  throw new Error('clarificationAgent: not implemented (P1)');
}
