import { useState } from 'react';
import { Slider, Stat } from '../ui/Plot';
const samples = [[1,1,2,3,4,5,5,9,9,10],[1,5,5,6,6,7,7,8,8,9],[1,3,4,6,7,7,7,8,8,10]];
export default function BootstrapLab() {
 const [step,setStep]=useState(0), [n,setN]=useState(10);
 const drawn=samples[step].slice(0,n), left=Array.from({length:10},(_,i)=>i+1).filter(x=>!drawn.includes(x));
 return <div className="pg not-content"><h4>Diez tarjetas, con reemplazo</h4><p className="pg-sub">Cada fila usa una muestra del notebook de la sesión. Avanza extracción por extracción; las tarjetas vacías son datos fuera de bolsa para este árbol.</p><div className="pg-row"><button onClick={()=>setStep((step+1)%3)}>Otra muestra</button><button onClick={()=>setN(Math.min(10,n+1))}>Siguiente extracción</button><button onClick={()=>setN(0)}>Reiniciar</button><Slider label="extracciones" value={n} min={0} max={10} step={1} onChange={setN}/></div><div className="pg-row" style={{gap:6,flexWrap:'wrap'}}>{Array.from({length:10},(_,i)=><span key={i} style={{padding:'0.5rem',border:'1px solid var(--sl-color-gray-4)',borderRadius:6,opacity:drawn.includes(i+1)?1:0.3}}>{i+1} ×{drawn.filter(x=>x===i+1).length}</span>)}</div><div className="pg-stats"><Stat k="extraídas" v={drawn.join(', ') || 'ninguna'}/><Stat k="fuera de bolsa" v={left.join(', ') || 'ninguna'}/></div><p className="pg-note">Con diez extracciones, una tarjeta queda fuera con probabilidad (9/10)¹⁰ = 34.9 %. Al crecer n, el valor tiende a 1/e = 36.8 %.</p></div>;
}
