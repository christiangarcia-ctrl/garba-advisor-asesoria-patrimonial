/* Bono de Fidelidad (OptiMaxx plus): cálculo de solo lectura para mostrar en pantalla.
   No toca los números principales de la proyección: el bono se presenta aparte y condicionado.
   Fuente: Folleto OptiMaxx plus 2025 (pág. 10) y Condiciones Generales, cláusula 3.6.
   - Porcentaje sobre la aportación comprometida del primer año, según plazo y monto anual.
   - Se genera con las aportaciones del primer año y rinde aparte: inflación + 5 %, tope 9 % anual.
   - Se acredita al fondo al terminar el plazo comprometido, si se cumple el esquema de aportaciones
     y el saldo promedio es >= 50 % de lo comprometido.
   Conservador: a 10-14 años con menos de $36,000 al año el folleto dice NA (las CG dicen 5 %); aquí no hay bono. */
(function(root){
'use strict';
// columnas: $36,000-59,999 · $60,000-89,999 · $90,000+ (10-14 años); desde $24,000 en los otros dos plazos
function pct(years,annual){
  if(!(years>=10)||!(annual>=24000))return 0;
  const tier=annual>=90000?3:annual>=60000?2:annual>=36000?1:0;
  if(years<15)return [0,.15,.25,.35][tier];
  if(years<20)return [.30,.40,.50,.60][tier];
  return [.55,.65,.75,1][tier];
}
/* o: {pmt (aportación mensual inicial), years (plazo comprometido en años), edad, rAcc (% anual del fondo), infl (% anual)}
   Devuelve null si no hay bono. Montos en pesos nominales de cada fecha. */
function calc(o){
  const years=Number(o.years),pmt=Number(o.pmt),edad=Number(o.edad);
  if(!(years>0)||!(pmt>0)||!(edad>0))return null;
  const annual=pmt*12,p=pct(years,annual);if(!p)return null;
  const total=Math.max(0,Math.round((65-edad)*12)),creditMonth=Math.min(Math.round(years*12),total);
  if(creditMonth<12)return null;
  const inicial=annual*p;
  const rb=Math.min((Number(o.infl)||4)/100+.05,.09),mb=Math.pow(1+rb,1/12)-1;
  // el bono se va formando conforme se pagan las 12 aportaciones del primer año
  let acreditado=0;for(let k=1;k<=12;k++)acreditado+=(inicial/12)*Math.pow(1+mb,creditMonth-k);
  const ma=(Number(o.rAcc)||10)/100/12;
  const a65=acreditado*Math.pow(1+ma,total-creditMonth);
  return {pct:p,annual,inicial,acreditado,creditMonth,a65,rb};
}
const api={pct,calc};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GaBono=api;
// Reporte (PDF): tarjeta aparte, siempre que el bono aplique. No altera la cifra principal ni las funciones financieras.
if(typeof document!=='undefined'){
  const money=v=>'$'+Math.round(v||0).toLocaleString('es-MX');
  const paintReport=()=>{
    const card=document.getElementById('rptBonoCard'),txt=document.getElementById('rptBonoText');if(!card||!txt||typeof reportState==='undefined')return;
    const B=reportState.fondo65?calc({pmt:parseFloat(document.getElementById('pmt').value),years:reportState.selectedYears,edad:reportState.edad,rAcc:reportState.rAcc,infl:reportState.infl}):null;
    card.style.display=B?'':'none';if(!B)return;
    const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],d=new Date();d.setMonth(d.getMonth()+B.creditMonth);
    const extra=reportState.ingreso65&&reportState.fondo65?reportState.ingreso65*B.a65/reportState.fondo65:0;
    txt.innerHTML='Porcentaje del plan: <strong>'+Math.round(B.pct*100)+'%</strong> de la aportación comprometida del primer año ('+money(B.annual)+') = <strong>'+money(B.inicial)+'</strong>. '
      +'Se forma con las aportaciones del primer año, rinde aparte (inflación + 5%, tope 9% anual) y se acredita a tu fondo al terminar el plazo comprometido ('+MES[d.getMonth()]+' '+d.getFullYear()+'): unos <strong>'+money(B.acreditado)+'</strong>'
      +(extra>0?', que al llegar a los 65 sumarían cerca de <strong>+'+money(extra)+'</strong> al mes':'')+'. Esta cifra va aparte de la proyección anterior. '
      +'Se recibe solo si cumples tu esquema de aportaciones y el saldo promedio de la póliza es de al menos 50% de lo comprometido; un periodo de descanso de hasta 12 meses lo conserva. Estimación, no garantizada.';
  };
  document.addEventListener('ga:projection-updated',paintReport);
}
})(typeof window!=='undefined'?window:globalThis);
