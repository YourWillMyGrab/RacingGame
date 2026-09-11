export interface Controls { throttle: number; brake: number; steer: number; handbrake: boolean; boost: boolean }
export class Input {
  private keys = new Set<string>();
  private padPrevious: boolean[] = [];
  onPause = () => {};
  onRecover = () => {};
  onConfirm = () => {};
  onNavigate = (_direction:number) => {};
  onChoice = (_index:number) => {};
  device = 'Tastiera';
  constructor() {
    window.addEventListener('keydown', e => {
      if (!e.repeat && e.code === 'Escape') { this.onPause(); return; }
      if (!e.repeat && e.code === 'Enter') { e.preventDefault(); this.onConfirm(); return; }
      if ((e.target as HTMLElement).matches('input:not([type=checkbox]),select,textarea')) return;
      if (!e.repeat && e.code === 'KeyR') { this.onRecover(); return; }
      if(!e.repeat && ['Digit1','Digit2','Digit3'].includes(e.code))this.onChoice(Number(e.code.at(-1))-1);
      if(!e.repeat && e.code==='ArrowLeft')this.onNavigate(-1);
      if(!e.repeat && e.code==='ArrowRight')this.onNavigate(1);
      if(!e.repeat && e.code==='ArrowUp')this.onNavigate(-1);
      if(!e.repeat && e.code==='ArrowDown')this.onNavigate(1);
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }
  clear() { this.keys.clear(); }
  sample(): Controls {
    const has = (...codes: string[]) => codes.some(c => this.keys.has(c));
    const result = { throttle: +has('KeyW','ArrowUp'), brake: +has('KeyS','ArrowDown'), steer: +has('KeyA','ArrowLeft') - +has('KeyD','ArrowRight'), handbrake: has('Space'), boost: has('ShiftLeft','ShiftRight') };
    const pad = Array.from(navigator.getGamepads?.() ?? []).find(p => p?.mapping === 'standard');
    if (pad) {
      const b = (i: number) => pad.buttons[i]?.pressed ?? false;
      if (b(9) && !this.padPrevious[9]) this.onPause();
      if (b(3) && !this.padPrevious[3]) this.onRecover();
      if(b(0)&&!this.padPrevious[0])this.onConfirm();
      if(b(14)&&!this.padPrevious[14])this.onNavigate(-1);
      if(b(15)&&!this.padPrevious[15])this.onNavigate(1);
      if(b(12)&&!this.padPrevious[12])this.onNavigate(-1);
      if(b(13)&&!this.padPrevious[13])this.onNavigate(1);
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
