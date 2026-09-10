export class EventBus<Events extends object> {
  private listeners=new Map<keyof Events,Set<(value:never)=>void>>();
  on<K extends keyof Events>(name:K,listener:(value:Events[K])=>void):()=>void {
    let set=this.listeners.get(name);if(!set){set=new Set();this.listeners.set(name,set);}
    set.add(listener as (value:never)=>void);
    return ()=>{set!.delete(listener as (value:never)=>void);if(!set!.size&&this.listeners.get(name)===set)this.listeners.delete(name);};
  }
  emit<K extends keyof Events>(name:K,value:Events[K]) {
    const set=this.listeners.get(name);if(!set)return;
    // Snapshot allows a hook to unsubscribe safely during dispatch.
    for(const listener of [...set])if(set.has(listener))listener(value as never);
  }
  clear(){this.listeners.clear();}
  get size(){let n=0;for(const set of this.listeners.values())n+=set.size;return n;}
}
