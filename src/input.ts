export interface Controls { throttle: number; brake: number; steer: number; handbrake: boolean; boost: boolean }
export class Input {
  private keys = new Set<string>();
  private previous = new Set<string>();
  private padPrevious: boolean[] = [];
  onPause = () => {};
  onRecover = () => {};
  device = 'Tastiera';
  constructor() {
    window.addEventListener('keydown', e => {
      if ((e.target as HTMLElement).matches('input,select,button')) return;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }
  clear() { this.keys.clear(); this.previous.clear(); }
  sample(): Controls {
    const has = (...codes: string[]) => codes.some(c => this.keys.has(c));
    if (has('Escape') && !this.previous.has('Escape')) this.onPause();
    if (has('KeyR') && !this.previous.has('KeyR')) this.onRecover();
    this.previous = new Set(this.keys);
    const result = { throttle: +has('KeyW','ArrowUp'), brake: +has('KeyS','ArrowDown'), steer: +has('KeyA','ArrowLeft') - +has('KeyD','ArrowRight'), handbrake: has('Space'), boost: has('ShiftLeft','ShiftRight') };
    const pad = Array.from(navigator.getGamepads?.() ?? []).find(p => p?.mapping === 'standard');
    if (pad) {
      const b = (i: number) => pad.buttons[i]?.pressed ?? false;
      if (b(9) && !this.padPrevious[9]) this.onPause();
      if (b(3) && !this.padPrevious[3]) this.onRecover();
      this.padPrevious = pad.buttons.map(b => b.pressed);
      const axis = pad.axes[0] ?? 0;
      if (Math.abs(axis) > .12) result.steer = -Math.sign(axis) * (Math.abs(axis) - .12) / .88;
      result.throttle = Math.max(result.throttle, pad.buttons[7]?.value ?? 0);
      result.brake = Math.max(result.brake, pad.buttons[6]?.value ?? 0);
      result.handbrake ||= b(0); result.boost ||= b(1) || b(5);
      this.device = 'Controller';
    } else { this.padPrevious = []; this.device = 'Tastiera'; }
    return result;
  }
}
