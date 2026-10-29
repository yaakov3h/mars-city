import {describe,it,expect} from 'vitest';
import {ANNEX,reviewWalkable,reviewFloorAt,annexLiftAt} from '../src/review-underground';
import {PARTNERSHIP} from '../src/partnership-room';
import {hexCenter} from '../scripts/layout.mjs';

const deg=(ax:number,az:number,bx:number,bz:number)=>(Math.round(Math.atan2(bz-az,bx-ax)*180/Math.PI)+360)%360;
describe('shared partnership room',()=>{
 const n=ANNEX[45],pro=ANNEX[27];
 it('sits at hex q-4 r6 on the level -8.4 floor',()=>{const [x,z]=hexCenter(-4,6);expect(n.theme).toBe('partnership');expect(n.x).toBeCloseTo(x,6);expect(n.z).toBeCloseTo(z,6);expect(n.fy).toBe(-8.4);expect(ANNEX).toHaveLength(49)});
 it('has one reciprocal door pair with the professions room: 240 here, 60 there',()=>{expect(deg(n.x,n.z,pro.x,pro.z)).toBe(240);expect(deg(pro.x,pro.z,n.x,n.z)).toBe(60);expect(n.doors).toEqual([240]);expect(pro.doors).toContain(60);expect(pro.doors).toContain(120)});
 it('keeps the passage level and walkable',()=>{for(let k=0;k<=85;k++){const t=k/100,x=pro.x+(n.x-pro.x)*t,z=pro.z+(n.z-pro.z)*t;expect(reviewFloorAt(x,z)).toBeCloseTo(-8.4,6);expect(reviewWalkable(x,z)).toBe(true)}});
 it('puts the lift at +3.6,0 so the surface head is at world (-13.72, 90)',()=>{const l=annexLiftAt(45);expect(l.x).toBeCloseTo(n.x+3.6,6);expect(l.z).toBeCloseTo(90,6);expect(l.x).toBeCloseTo(-13.7205,3)});
 it('fits the measured clearances',()=>{const lx=PARTNERSHIP.liftDx;expect(lx-.95-PARTNERSHIP.stageR).toBeGreaterThanOrEqual(1);expect(lx-1-PARTNERSHIP.stageR).toBeGreaterThanOrEqual(.9);expect(PARTNERSHIP.baseDx+PARTNERSHIP.baseR).toBeLessThan(PARTNERSHIP.stageR);expect(PARTNERSHIP.stageH+PARTNERSHIP.statueH).toBeCloseTo(1.8,6);expect(PARTNERSHIP.portraitBottom+PARTNERSHIP.portrait).toBeLessThan(4)});
 it('blocks the stage and leaves the ring and the lift reachable',()=>{expect(reviewWalkable(n.x,n.z)).toBe(false);expect(reviewWalkable(n.x+3.6,n.z+1.2)).toBe(true);expect(reviewWalkable(n.x-3,n.z)).toBe(true)});
});

import {MONUMENT_GROUND_PAD,MONUMENT_LIFT} from '../src/oct24-monument';
describe('lift stops follow the monument plinth floor',()=>{
  it('the leveled pad sits below the plinth floor, so stops must not be taken from ground()',()=>{
    expect(MONUMENT_GROUND_PAD.drop).toBeGreaterThan(0);
    expect(MONUMENT_LIFT.undergroundFloor).toBe(-8.4);
    expect(MONUMENT_LIFT.stops).toEqual([0,46,52]);
  });
});
