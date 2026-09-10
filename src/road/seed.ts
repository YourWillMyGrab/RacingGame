export function normalizeSeed(value: string): string {
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
  return cleaned || '7F2C-A91D';
}

/** Each named stream starts from its own hash; cosmetic calls cannot change roads/rewards. */
export function randomStream(seed: string, name: string) {
  let state = 2166136261;
  for (const char of `${normalizeSeed(seed)}:${name}`) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let n = Math.imul(state ^ state >>> 15, 1 | state);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

export function freshSeed() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, '0').toUpperCase();
  return `${n.slice(0,4)}-${n.slice(4)}`;
}
