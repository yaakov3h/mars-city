declare module 'troika-three-text' {
 import {Mesh} from 'three';
 export class Text extends Mesh {
 text:string;direction:string;font:string;fontSize:number;anchorX:string;anchorY:string;color:string;outlineWidth:number;outlineColor:string;outlineOpacity:number;colorRanges:Record<number,string>;sync(callback?:()=>void):void;dispose():void;
 }
}
