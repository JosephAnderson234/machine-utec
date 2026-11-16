import { useState } from 'react';
import Plot, { Slider } from '../ui/Plot';

const pts: [number, number, number][] = [[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
export default function NeuronaXor() {
  const [w1,W1]=useState(1), [w2,W2]=useState(1), [b,B]=useState(-0.5), [step,S]=useState(1);
  const pred=(x:number,y:number)=> +(w1*x+w2*y+b>0);
  const hits=pts.filter(([x,y,t])=>pred(x,y)===t).length;
  return <div className="pg not-content">
    <h4>XOR: prueba una recta</h4><p className="pg-sub">Ajusta los tres números. Verde significa acierto; rojo, error. La frontera nunca acierta las cuatro esquinas.</p>
    <div className="pg-row"><Slider label="w₁" value={w1} min={-3} max={3} step={0.25} onChange={W1}/><Slider label="w₂" value={w2} min={-3} max={3} step={0.25} onChange={W2}/><Slider label="b" value={b} min={-3} max={3} step={0.25} onChange={B}/></div>
    <div className="pg-row"><button onClick={()=>S(Math.min(4,step+1))} disabled={step===4}>Siguiente esquina</button><button onClick={()=>S(1)}>Reiniciar</button><b>Aciertos: {hits}/4</b></div>
    <Plot x={[-0.25,1.25]} y={[-0.25,1.25]} h={300} xlabel="x₁" ylabel="x₂" ariaLabel="Cuatro esquinas de XOR con la recta de decisión">{s=><>{Math.abs(w2)>1e-8 && <line x1={s.X(-0.25)} y1={s.Y((-b+0.25*w1)/w2)} x2={s.X(1.25)} y2={s.Y((-b-1.25*w1)/w2)} stroke="var(--sl-color-accent)" strokeWidth={2} />}{Math.abs(w2)<=1e-8 && Math.abs(w1)>1e-8 && <line x1={s.X(-b/w1)} x2={s.X(-b/w1)} y1={s.Y(-0.25)} y2={s.Y(1.25)} stroke="var(--sl-color-accent)" strokeWidth={2} />}{pts.slice(0,step).map(([x,y,t],i)=><g key={i}><circle cx={s.X(x)} cy={s.Y(y)} r={15} fill={pred(x,y)===t?'var(--pg-ok)':'var(--pg-bad)'}/><text x={s.X(x)} y={s.Y(y)+5} textAnchor="middle" fill="white" fontWeight="bold">{t}</text></g>)}</>}</Plot>
    <p>f(0,0)+f(1,1) = f(0,1)+f(1,0) = w₁+w₂+2b. XOR pediría que la primera suma fuera negativa y la segunda positiva.</p>
  </div>;
}
