import { useState } from 'react';
import Plot, { C0, C1, Slider, Stat } from '../ui/Plot';
const xs=[2,3,4,5,10,11,12,13];
export default function KMeansSteps(){
 const [a,setA]=useState(4),[b,setB]=useState(6),[phase,setPhase]=useState(0);
 const lab=xs.map(x=>Math.abs(x-a)<=Math.abs(x-b)?0:1), groups=[xs.filter((_,i)=>lab[i]===0),xs.filter((_,i)=>lab[i]===1)];
 const cost=xs.reduce((v,x,i)=>v+(x-(lab[i]?b:a))**2,0);
 const next=()=>{if(phase===0){setPhase(1);}else{if(groups[0].length)setA(groups[0].reduce((s,x)=>s+x,0)/groups[0].length);if(groups[1].length)setB(groups[1].reduce((s,x)=>s+x,0)/groups[1].length);setPhase(0);}};
 return <div className="pg not-content"><h4>k-means: asignar y mover</h4><p className="pg-sub">Los ocho alquileres del curso. Parte con centros 4 y 6; «Siguiente» alterna entre asignar cada alquiler y mover centros a las medias.</p><div className="pg-row"><Slider label="centro A" value={a} min={2} max={13} step={0.5} onChange={x=>{setA(x);setPhase(0)}}/><Slider label="centro B" value={b} min={2} max={13} step={0.5} onChange={x=>{setB(x);setPhase(0)}}/><button onClick={next}>Siguiente</button><button onClick={()=>{setA(4);setB(6);setPhase(0)}}>Reiniciar</button></div><Plot x={[1,14]} y={[-0.4,1.5]} h={220} xlabel="alquiler">{s=><>{xs.map((x,i)=><circle key={i} cx={s.X(x)} cy={s.Y(lab[i]?1:0)} r={7} fill={lab[i]?C1:C0}/>) }<line x1={s.X(a)} x2={s.X(a)} y1={s.Y(-0.2)} y2={s.Y(1.3)} stroke={C0} strokeWidth={2}/><line x1={s.X(b)} x2={s.X(b)} y1={s.Y(-0.2)} y2={s.Y(1.3)} stroke={C1} strokeWidth={2}/></>}</Plot><div className="pg-stats"><Stat k="grupo A" v={groups[0].join(', ')}/><Stat k="grupo B" v={groups[1].join(', ')}/><Stat k="WCSS actual" v={cost.toFixed(2)}/></div><p className="pg-note">{phase===0?'Ahora asigna cada punto al centro más cercano.':'Ahora mueve cada centro a la media de su grupo.'} La WCSS se mide con los centros visibles; cada movimiento óptimo la baja o la deja igual.</p></div>;
}
