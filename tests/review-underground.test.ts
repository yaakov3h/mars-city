import {it,expect} from 'vitest';
import {REVIEW,reviewFloor,reviewWalkable} from '../src/review-underground';
it('anchors review to the actual two existing building hex centers',()=>{expect(REVIEW.left).toBeCloseTo(-34.641016);expect(REVIEW.right).toBeCloseTo(-17.320508);expect(REVIEW.edge).toBeCloseTo((REVIEW.left+REVIEW.right)/2)});
it('connects two rooms through a continuous shared-face passage',()=>{for(let x=REVIEW.left;x<REVIEW.right;x+=.1)expect(reviewWalkable(x,0)).toBe(true);expect(reviewWalkable(REVIEW.edge,3)).toBe(false)});
it('keeps ramp heights continuous and bounded',()=>{expect(reviewFloor(-31)).toBe(-9);expect(reviewFloor(-21)).toBe(-8.2);expect(reviewFloor(REVIEW.edge)).toBeCloseTo(-8.6);});
it('keeps columns and excavation pockets out of the walking path',()=>{expect(reviewWalkable(REVIEW.left+3.3,3.4)).toBe(false);expect(reviewWalkable(REVIEW.right+3.2,-3.8)).toBe(false);});
