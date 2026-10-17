import {describe,it,expect} from 'vitest';
import {cameraDamping,TapGesture} from '../src/camera-controls';
describe('camera response',()=>{
 it('settles at the same rate across 20, 60 and 120 Hz',()=>{for(const fps of [20,60,120]){let residual=1;for(let i=0;i<fps;i++)residual*=1-cameraDamping(1/fps);expect(residual).toBeCloseTo(Math.exp(-1/.085),10)}});
 it('does not apply extra damping for simultaneous event updates',()=>{expect(cameraDamping(0)).toBe(0);expect(cameraDamping(-1)).toBe(0)});
});
describe('tap separation',()=>{
 it('accepts a short stationary tap',()=>{const t=new TapGesture();t.start(1,0,0,0);expect(t.end(1,2,3,100)).toBe('single');expect(t.active).toBe(false)});
 it('rejects a drag even if it returns to its starting point',()=>{const t=new TapGesture();t.start(1,0,0,0);t.move(1,30,0);expect(t.end(1,0,0,100)).toBe(null)});
 it('rejects long holds',()=>{const t=new TapGesture();t.start(1,0,0,0);expect(t.end(1,0,0,700)).toBe(null)});
 it('rejects both fingers of a pinch or pan',()=>{const t=new TapGesture();t.start(1,0,0,0);t.start(2,0,0,10);expect(t.end(1,0,0,100)).toBe(null);expect(t.end(2,0,0,100)).toBe(null)});
 it('detects a second quick tap as double and resets after it',()=>{const t=new TapGesture();t.start(1,0,0,0);expect(t.end(1,1,1,100)).toBe('single');t.start(1,2,2,200);expect(t.end(1,2,2,300)).toBe('double');t.start(1,2,2,400);expect(t.end(1,2,2,500)).toBe('double');t.start(1,2,2,1200);expect(t.end(1,2,2,1300)).toBe('single')});
 it('keeps distant or slow second taps single',()=>{const t=new TapGesture();t.start(1,0,0,0);expect(t.end(1,0,0,100)).toBe('single');t.start(1,200,0,200);expect(t.end(1,200,0,300)).toBe('single');t.start(1,200,0,900);expect(t.end(1,200,0,1000)).toBe('single')});
 it('rejects cancellation and lost capture',()=>{const t=new TapGesture();t.start(1,0,0,0);t.cancel(1);expect(t.end(1,0,0,100)).toBe(null)});
});
