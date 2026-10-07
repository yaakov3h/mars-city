// A short time-based response, shared by RAF and input-driven OrbitControls updates.
export function cameraDamping(seconds:number){return -Math.expm1(-Math.max(0,seconds)/.085)}
export class TapGesture {
 private pointers=new Map<number,{x:number;y:number;at:number;valid:boolean}>();
 get active(){return this.pointers.size>0}
 start(id:number,x:number,y:number,at:number){const multiple=this.active;for(const p of this.pointers.values())p.valid=false;this.pointers.set(id,{x,y,at,valid:!multiple})}
 move(id:number,x:number,y:number){const p=this.pointers.get(id);if(p&&Math.hypot(x-p.x,y-p.y)>8)p.valid=false}
 end(id:number,x:number,y:number,at:number){this.move(id,x,y);const p=this.pointers.get(id);this.pointers.delete(id);return !!p&&p.valid&&at-p.at<=450}
 cancel(id:number){this.pointers.delete(id)}
}
