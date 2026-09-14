export type RivalPhase='reading'|'attack'|'cooldown';
/** Faro attacks only a clear straight; corners/wind interrupt the burst.
 * Timers use simulation dt and never depend on player position or wall time. */
export class FaroTactics {
  phase:RivalPhase='reading';
  remaining=0;
  attacks=0;
  step(clear:boolean,dt:number) {
    this.remaining=Math.max(0,this.remaining-dt);
    if(this.phase==='attack'&&(!clear||this.remaining===0)){this.phase='cooldown';this.remaining=5;}
    else if(this.phase==='cooldown'&&this.remaining===0)this.phase='reading';
    else if(this.phase==='reading'&&clear){this.phase='attack';this.remaining=2.5;this.attacks++;}
    return this.phase;
  }
}
