/* Display geometry only. Financial amounts are read from the existing report and chart. */
(function(){
'use strict';
const $=id=>document.getElementById(id),money=n=>Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const host=document.createElement('section');host.id='gaPath';host.className='card';
host.innerHTML='<h2>Tu camino</h2><div id="gaPathGraph"></div><div id="gaPathMilestones" class="ga-path-milestones"></div><small>Gráfica ilustrativa, sin escala de rendimiento ni garantía de crecimiento. Las inversiones pueden apreciarse o depreciarse.</small><div class="ga-path-options"><section class="card"><h3>Primeros 18 meses: armas tu base</h3><p>Tu constancia puede ser reconocida con un bono sujeto a las condiciones del plan.</p></section><section><h3>Después: tú decides</h3><div id="gaFlexButtons"></div><div id="gaFlexDetail" class="card" hidden></div></section></div>';
$('gaPane-projection').append(host);
const originalGraph=$('gaProjectionGraph'),graphAnchor=document.createComment('Round 2 original graph');originalGraph.before(graphAnchor);
const choices=[['Ⅱ','Pausar','¿Un mal año? Puedes parar hasta 12 meses.','Puedes pausar hasta 12 meses durante la vigencia del plan.'],['+','Aportar más','¿Te sobró dinero? Lo puedes meter.','Aportar más · Cuando tengas excedentes'],['↑','Subir tu aportación','¿Ganas más? Aportas más.','Incrementar · Si aumentan tus ingresos'],['↓','Sacar una parte','Retiros parciales. Aplican condiciones.','Los retiros parciales y préstamos dependen de las condiciones del contrato.'],['⌂','Pedir prestado','Hasta 50% del saldo comprometido en alternativas conservadoras, sujeto a aprobación de Allianz y a las condiciones del contrato.','Hasta 50% del saldo comprometido en alternativas conservadoras. Préstamos sujetos a aprobación de Allianz y a las condiciones del contrato.']];
choices.forEach(([icon,title,brief,text],i)=>{const b=document.createElement('button');b.type='button';b.className='btn-light';b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','gaFlexDetail');b.innerHTML=`<b>${icon} ${title}</b><span>${brief}</span>`;b.onclick=()=>{const close=b.getAttribute('aria-expanded')==='true';$('gaFlexButtons').querySelectorAll('button').forEach(x=>x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',String(!close));$('gaFlexDetail').hidden=close;$('gaFlexDetail').textContent=text};$('gaFlexButtons').append(b)});
function milestones(age,years,now=new Date()){
 const entry=(months,title)=>{const date=new Date(now.getFullYear(),now.getMonth()+months,1);const fullMonths=Math.round(age*12)+months;return {months,title,date:`${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`,age:`${Math.floor(fullMonths/12)} años${fullMonths%12?' y '+fullMonths%12+' meses':''}`}};
 return [entry(0,'Hoy · empiezas con '+money($('pmt').value)+' al mes'),entry(18,'Mes 18 · tu base está lista: se abren tus opciones'),entry(Math.round(years*12),'Terminas de aportar · llevas '+money(reportState.fondoPlan)),entry(Math.round((65-age)*12),'65 años · empiezas a recibir '+money(reportState.ingresoMensual)+' al mes')];
}
function render(){
 const classic=window.GA_FLOW_CLASSIC===true;host.hidden=classic;
 if(classic){graphAnchor.after(originalGraph)}else{$('gaPane-gap').append(originalGraph)}
 if(classic||typeof chart==='undefined'||!chart||!reportState.fondo65)return;
 const age=Number($('edad').value),years=reportState.planYears,end=reportState.fondo65;
 const points=milestones(age,years);$('gaPathMilestones').replaceChildren(...points.map(p=>{const el=document.createElement('section');el.dataset.months=p.months;el.innerHTML='<b></b><p></p>';el.firstChild.textContent=(points.indexOf(p)+1)+'. '+p.title;el.lastChild.textContent=p.date+' · '+p.age;return el}));
 // Annual source points remain untouched; intermediate positions only draw the illustrative stroke.
 const source=[0,...chart.data.datasets[0].data.map(Number)];
 host.dataset.source=JSON.stringify(source);
 const estimate=[],wave=[];
 for(let j=0;j<=240;j++){const t=j/240,pos=t*(source.length-1),k=Math.min(source.length-2,Math.floor(pos)),f=pos-k;const v=source[k]+(source[k+1]-source[k])*f;estimate.push(v);wave.push(j===0?0:j===240?end:Math.max(0,v+end*.065*Math.sin(t*16*Math.PI)*Math.sin(Math.PI*t)))}
 estimate[estimate.length-1]=end;
 const W=1200,H=460,L=24,R=1170,T=130,B=390,x=t=>L+t*(R-L),y=v=>B-(v/end)*(B-T);
 const path=a=>a.map((v,i)=>(i?'L':'M')+x(i/(a.length-1)).toFixed(2)+','+y(v).toFixed(2)).join(' ');
 const baseX=x(Math.min(1,18/((65-age)*12)));
 const dots=points.map(p=>{const t=Math.min(1,p.months/((65-age)*12)),idx=Math.round(t*240);const lx=24+points.indexOf(p)*290;return `<text x="${lx}" y="62" fill="#001868" font-size="25">${points.indexOf(p)+1} · ${p.date}</text><text x="${lx}" y="94" fill="#001868" font-size="22">${p.age}</text><path d="M ${lx+12} 106 L ${x(t)} ${y(estimate[idx])}" stroke="#dce3ee" fill="none"/><circle data-months="${p.months}" cx="${x(t)}" cy="${y(estimate[idx])}" r="7" fill="#8bafff"/><text x="${x(t)}" y="${y(estimate[idx])-12}" fill="#001868" font-size="22">${points.indexOf(p)+1}</text>`}).join('');
 let valley=60;for(let j=55;j<180;j++)if(wave[j]<wave[j-1]&&wave[j]<=wave[j+1]){valley=j;break;}
 $('gaPathGraph').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tu camino: lo que estimamos y movimiento ilustrativo" data-capital="${end}" data-wave-end="${wave.at(-1)}"><rect x="${L}" y="${T}" width="${baseX-L}" height="${B-T}" fill="#8bafff" opacity=".16"/><path d="${path(estimate)}" fill="none" stroke="#8bafff" stroke-width="4" stroke-dasharray="9 7"/><path d="${path(wave)}" fill="none" stroke="#001868" stroke-width="4"/>${dots}<text x="24" y="22" fill="#001868" font-size="22">Primeros 18 meses: armas tu base</text><path d="M ${x(valley/240)} ${y(wave[valley])} L 420 418" stroke="#001868" fill="none"/><text x="180" y="450" fill="#001868" font-size="24">Cuando baja, tu misma aportación compra más</text></svg><p class="ga-path-legend">┄ Lo que estimamos　 ━ Cómo se mueve de verdad: sube y baja</p>`;
 const mobile=$('gaMobilePath');if(mobile)mobile.lastElementChild.innerHTML=$('gaPathMilestones').innerHTML;
}
window.GaPath={render,milestones};document.addEventListener('ga:projection-updated',render);
})();
