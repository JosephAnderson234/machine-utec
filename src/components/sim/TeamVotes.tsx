import { useState } from 'react';
import Plot, { Path, CA, C0, C1, Slider, Stat } from '../ui/Plot';

const choose = (n: number, k: number) => { let v = 1; for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i; return v; };
const majority = (p: number, n: number) => Array.from({ length: n - Math.floor(n / 2) }, (_, i) => i + Math.floor(n / 2) + 1).reduce((s, k) => s + choose(n, k) * p ** k * (1 - p) ** (n - k), 0);
export default function TeamVotes() {
  const [p, setP] = useState(0.7), [n, setN] = useState(3), [shared, setShared] = useState(0);
  const curve: [number, number][] = Array.from({ length: 13 }, (_, i) => [2 * i + 1, (1 - shared) * majority(p, 2 * i + 1) + shared * p]);
  return <div className="pg not-content"><h4>¿Cuándo gana el equipo?</h4><p className="pg-sub">Cada votante acierta con probabilidad p. Con probabilidad «errores compartidos», todos copian una misma respuesta; el resto de las veces votan independientemente.</p>
    <div className="pg-row"><Slider label="acierto individual p" value={p} min={0.1} max={0.9} step={0.05} onChange={setP} show={p.toFixed(2)} /><Slider label="votantes (impar)" value={n} min={1} max={25} step={2} onChange={setN} /><Slider label="errores compartidos" value={shared} min={0} max={1} step={0.1} onChange={setShared} show={`${Math.round(shared * 100)} %`} /></div>
    <Plot x={[1,25]} y={[0,1]} xlabel="número de votantes" ylabel="P(equipo acierta)" h={260}>{s => <><Path pts={curve} s={s} color={CA} width={3}/><Path pts={[[1,p],[25,p]]} s={s} color={C0} dash="5 4"/><circle cx={s.X(n)} cy={s.Y((1-shared)*majority(p,n)+shared*p)} r={7} fill={C1}/></>}</Plot>
    <div className="pg-stats"><Stat k="uno" v={p.toFixed(3)}/><Stat k="equipo" v={((1-shared)*majority(p,n)+shared*p).toFixed(3)}/></div><p className="pg-note">Con p = 0.70, tres independientes dan 0.784. Copiar al mismo votante deja el resultado en 0.70. Si p &lt; 0.5, sumar votantes independientes empeora la mayoría.</p></div>;
}
