/**
 * API base URL for the rewrite endpoint.
 *
 * In development the web app runs on localhost:3000. The extension's
 * popup runs in an isolated chrome-extension:// context, so it can
 * fetch localhost without CORS issues.
 *
 * For a production build, set this to the deployed URL.
 */
export const API_BASE: string =
  (typeof process !== 'undefined' && process.env['PLASMO_PUBLIC_API_URL']) ||
  'http://localhost:3000';
