// utils/perfUtils.ts
export function burnCPU(ms: number) {
  const start = performance.now();
  while (performance.now() - start < ms) { /* empty */ }
}

export function triggerRenders(
  setState: React.Dispatch<React.SetStateAction<number>>,
  count: number
) {
  for (let i = 0; i < count; i++) {
    setState(c => c + 1);
  }
}
