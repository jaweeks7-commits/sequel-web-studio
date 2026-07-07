import { connectLambda } from '@netlify/blobs';

// Legacy (V1, Lambda-compatible) Netlify functions — the `export const handler`
// style used across this project — do NOT auto-receive the Netlify Blobs
// context. Without initializing it from the invocation event, getStore() throws
// "The environment has not been configured to use Netlify Blobs". Call this once
// at the top of any handler before using getStore.
//
// Wrapped in try/catch so local dev / unit tests (where the event has no `blobs`
// field) don't crash — getStore there will simply fall back to its own error.
export function connectBlobs(event: unknown): void {
  try {
    connectLambda(event as Parameters<typeof connectLambda>[0]);
  } catch {
    /* not a live Netlify invocation (e.g. local dev or a test harness) */
  }
}
