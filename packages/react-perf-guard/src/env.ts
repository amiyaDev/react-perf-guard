export const isDev =
  typeof process !== "undefined"
    ? process.env.NODE_ENV !== "production"
    : true;

// Lets a consumer explicitly run PerfGuard outside of NODE_ENV=development —
// e.g. a staging deployment, or a public demo meant to showcase the tool
// where a production build is otherwise required (Vercel, etc). Off by
// default: real production apps should never enable this, since the whole
// point of PerfGuard is zero cost in production.
let forcedEnabled = false;

export function setForceEnabled(value: boolean) {
  forcedEnabled = value;
}

export function isPerfGuardActive(): boolean {
  return isDev || forcedEnabled;
}
