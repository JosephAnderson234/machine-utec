import { useState } from 'react';
import Plot, { C0, C1 } from '../ui/Plot';
const corners:[number,number,number][]=[[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
export default function RedXorPaso(){
  const [i,I]=useState(0),[k,K]=useState(0); const [x,y,target]=corners[i];
  const z1=x+y,z2=x+y-1,h1=Math.max(0,z1),h2=Math.max(0,z2),out=h1-2*h2;
  return <div className="pg not-content"><h4>Red B: mezcla, dobla, combina</h4><p className="pg-sub">Escoge una esquina y avanza por la red ReLU de las diapositivas.</p>
    <div className="pg-seg">{corners.map(([a,b],j)=><button key={j} className={i===j?'active':''} onClick={()=>{I(j);K(0)}}>({a},{b})</button>)}</div>
    <div className="pg-row"><button onClick={()=>K(Math.min(3,k+1))}>Siguiente</button><button onClick={()=>K(0)}>Reiniciar</button></div>
    <div className="pg-stats"><div className="pg-stat"><span className="k">entrada</span><span className="v">({x},{y})</span></div>{k>=1&&<div className="pg-stat"><span className="k">mezcla z</span><span className="v">({z1},{z2})</span></div>}{k>=2&&<div className="pg-stat"><span className="k">ReLU h</span><span className="v">({h1},{h2})</span></div>}{k>=3&&<div className="pg-stat"><span className="k">salida</span><span className="v">{h1} − 2×{h2} = {out} (real {target})</span></div>}</div>
    <Plot x={[-0.3,2.3]} y={[-0.3,2.3]} h={260} xlabel={k>=2?'h₁':'x₁'} ylabel={k>=2?'h₂':'x₂'} ariaLabel="Transformación de las cuatro esquinas por la capa oculta">{s=><>{corners.map(([a,b,t],j)=>{const xx=k>=2?Math.max(0,a+b):a,yy=k>=2?Math.max(0,a+b-1):b;return <g key={j}><circle cx={s.X(xx)} cy={s.Y(yy)} r={i===j?12:8} fill={t?C1:C0} opacity={i===j?1:0.5}/><text x={s.X(xx)+10} y={s.Y(yy)-7} fontSize={11} fill="var(--sl-color-white)">{j}</text></g>})}</>}</Plot>
    <p>Al activar la capa oculta, las esquinas se transforman en (0,0), (1,0), (1,0) y (2,1). La salida h₁−2h₂ ya separa XOR.</p>
  </div>;
}
