export const HEX_SIZE:number;
export const CRATERS:ReadonlyArray<{id:string;x:number;z:number;radius:number}>;
export const EDGES:number[][];
export const hexCenter:(q:number,r:number)=>number[];
export function buildable(q:number,r:number):boolean;
export function nextHex(districts:Array<{q:number;r:number;plots?:Array<{q:number;r:number}>}>,landmarks:Array<{q:number;r:number}>,seed:string):{q:number;r:number};
