// Tiny pub/sub so the "last commit time" badge can update without
// forcing the (expensive) table it's measuring to re-render itself.
type Listener = (ms: number) => void;

let last = 0;
const listeners = new Set<Listener>();

export function reportRender(ms: number) {
  last = ms;
  listeners.forEach((l) => l(ms));
}

export function subscribeTimer(listener: Listener) {
  listeners.add(listener);
  listener(last);
  return () => {
    listeners.delete(listener);
  };
}
