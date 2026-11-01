(function(){
'use strict';
const host=document.createElement("section");host.id="gaPath";host.innerHTML='\n  <div class="head">\n    <div class="story" id="gaPathstory"></div>\n    <div class="hero">\n      <small>A los 65 recibes</small>\n      <b id="gaPathhNum">—</b>\n      <span>al mes · estimado</span>\n      <div class="sub2">Lo que juntas a los 65: <strong id="gaPathhFund">—</strong></div>\n    </div>\n  </div>\n\n  <div class="chart">\n    <div class="legend" id="gaPathlegend"></div>\n    <svg id="gaPathsvg" viewBox="0 0 1300 440" aria-label="Tu camino"></svg>\n    <div class="disc">Gráfica ilustrativa, sin escala de rendimiento ni garantía de crecimiento. Las inversiones pueden apreciarse o depreciarse.</div>\n  </div>\n\n  <div class="steps" id="gaPathsteps"></div>\n';
document.getElementById("gaPane-projection").append(host);
const originalGraph=document.getElementById("gaProjectionGraph"),graphAnchor=document.createComment("Original graph");originalGraph.before(graphAnchor);

const $=id=>document.getElementById(id);
let AGE,START=new Date(),PMT,YEARS,DATA={},TOTAL,M60,END,reg,REINV,ING;
let step=0,chip=null;
const calcMensual=f=>f===reportState.fondo65?reportState.ingreso65:reportState.ingreso60;
const money=v=>'$'+Math.round(v||0).toLocaleString('es-MX');
const mill=v=>v<1e6?money(v):'$'+(v/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' millones';
const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const dateAt=m=>{const d=new Date(START);d.setMonth(d.getMonth()+m);return MESES[d.getMonth()]+' '+d.getFullYear()};
// Interpolación visual de los saldos anuales existentes, sin simular rendimientos.
function curve(d){
 const source=[Number(document.getElementById('lumpSum').value)||0,...chart.data.datasets[0].data.map(Number)];
 const pts=Array.from({length:TOTAL+1},(_,m)=>{const pos=m/12,k=Math.min(source.length-2,Math.floor(pos));return source[k]+(source[k+1]-source[k])*(pos-k)});
 pts[END]=d.fondoPlan;pts[TOTAL]=d.fondo65;return pts;
}
// onda irregular determinista: empieza en 0 y termina exacto en el valor final
function wave(pts){
  return pts.map((v,m)=>{const t=m/TOTAL;const env=Math.sin(Math.PI*t)**.8;
    const n=.55*Math.sin(m/11+.4)+.32*Math.sin(m/4.7+1.3)+.22*Math.sin(m/27+2.1)+.12*Math.sin(m/2.3);
    const c=Math.round(END*.62),dd=m>c-14&&m<c+16?-.13*Math.sin(Math.PI*(m-(c-14))/30):0; // una caída clara a media vida
    return m===0?0:m===TOTAL?pts[TOTAL]:Math.max(0,v*(1+.13*env*n+dd));});
}

// ===== geometría =====
let NARROW,F,W,H,PL,PR,PT,PB;
function geometry(){NARROW=window.innerWidth<=760;F=NARROW?1.9:1;W=NARROW?640:1300;H=NARROW?470:440;
 // Escritorio: el viewBox usa los pixeles reales del SVG para que la gráfica llene el ancho y el texto no se encoja.
 const box=document.getElementById('gaPathsvg')?.getBoundingClientRect();if(!NARROW&&box&&box.width>0&&box.height>0){W=Math.round(box.width);H=Math.round(box.height)}PL=NARROW?92:70;PR=NARROW?20:40;PT=NARROW?70:48;PB=NARROW?96:62;}
const X=m=>PL+(W-PL-PR)*m/TOTAL;
let Y;
const path=a=>a.map((v,m)=>(m?'L':'M')+X(m).toFixed(1)+' '+Y(v).toFixed(1)).join('');

function stepsFor(){
  const d=DATA[reg];
  const s=[
   {k:'Empiezas',sm:dateAt(0)+' · '+AGE+' años',range:[0,6],
    t:'Hoy empiezas con <em>'+money(PMT)+'</em> al mes.',p:'Es lo único que decides hoy. Lo demás lo hace el tiempo.'},
   {k:'Tu base',sm:'Mes 1 al 18',range:[0,18],
    t:'Los primeros <em>18 meses</em> armas tu base.',p:'Tu constancia puede ser reconocida con un bono, sujeto a las condiciones del plan. En '+dateAt(18)+' ya se abren tus opciones.'},
   {k:'Sube y baja',sm:'Toda la inversión',range:[0,TOTAL],wave:true,
    t:'Tu dinero está invertido: <em>sube y baja</em>.',p:'Cuando baja, tu misma aportación compra más. Lo que cuenta es el camino completo, no un mes.'},
   {k:'Tú decides',sm:'Desde el mes 19',range:[18,END],chips:true,
    t:'Después del mes 18, <em>tú decides</em>.',p:'Toca una opción:'},
  ];
  if(reg==='151') s.push({k:'Te devuelven',sm:'Cada año, al declarar',range:[0,END],refund:true,
    t:'Cada año te <em class="g">devuelven impuestos</em>.',
    p:REINV?'Unos <b>'+money(d.dev1)+'</b> el primer año. Como los vuelves a meter al plan, <b>'+mill(d.impacto65)+'</b> de lo que juntas a los 65 vienen de ahí.'
            :'Unos <b>'+money(d.dev1)+'</b> el primer año, para ti. Si los metes al plan, tu retiro crece todavía más.',
    ing:true,
    fine:'Deducción sujeta a límites y requisitos fiscales; depende de tu situación como contribuyente.'});
  else if(reg==='93') s.push({k:'Desde los 60',sm:dateAt(M60)+' · 60 años',range:[M60-4,M60+4],at60:true,
    t:'Desde los 60 ya puedes <em>empezar a recibir</em>.',
    p:'Unos <b>'+money(calcMensual(d.fondo60))+'</b> al mes. Puede salir libre de impuestos si llevas 5 años en el plan.',
    fine:'El beneficio depende de la modalidad, los requisitos aplicables y la legislación vigente.'});
  s.push({k:'Tu retiro',sm:dateAt(TOTAL)+' · 65 años',range:[END,TOTAL],end:true,
    t:'A los 65 recibes <em>'+money(calcMensual(d.fondo65))+'</em> al mes.',
    p:'Dejas de aportar a los '+(AGE+YEARS)+' y tu dinero sigue creciendo hasta los 65: juntas <b>'+mill(d.fondo65)+'</b>.',
    fine:'Es una estimación. El dinero de '+(START.getFullYear()+65-AGE)+' no vale lo mismo que el de hoy.'});
  return s;
}

const CHIPS=[
 ['Ⅱ','Pausar','¿Un mal año? Puedes pausar hasta 12 meses.'],
 ['+','Aportar más','¿Te sobró dinero? Lo puedes meter cuando quieras.'],
 ['↑','Subir tu aportación','¿Ganas más? Aumentas lo que aportas.'],
 ['↓','Sacar una parte','Puedes hacer retiros parciales. Aplican condiciones.'],
 ['⌂','Pedir prestado','Hasta 50% de tu saldo comprometido en alternativas conservadoras, sujeto a aprobación de Allianz y a las condiciones del contrato.'],
];

function paint(){
  const d=DATA[reg], S=stepsFor(), cur=step?S[step-1]:null;host.style.setProperty('--path-steps',S.length);
  document.getElementById('gaPathhNum').textContent=money(calcMensual(d.fondo65));
  document.getElementById('gaPathhFund').textContent=mill(d.fondo65);

  // narración
  const st=document.getElementById('gaPathstory');
  if(!cur){st.innerHTML='<div class="kicker">Tu camino</div><h1>Así crece tu retiro, paso a paso.</h1><p>Toca el primer paso o usa las flechas para ver cómo funciona tu plan.</p>';}
  else{
    let p=cur.p;
    if(cur.chips){const c=chip!=null?CHIPS[chip]:null;
      p=c?c[2]+(chip===3?' <span style="color:var(--muted)">'+(reg==='151'?'Para que salga libre de impuestos, retira desde los 65 (hasta 15 UMAs al año).':'Para que salga libre de impuestos, retira desde los 60 y con 5 años en el plan.')+'</span>':''):cur.p;}
    st.innerHTML='<div class="kicker">Paso '+step+' de '+S.length+'</div><h1>'+cur.t+'</h1><p>'+p+'</p>'+
      (cur.chips?'<div class="chips">'+CHIPS.map((c,i)=>'<button class="chip'+(chip===i?' on':'')+'" data-chip="'+i+'"><i>'+c[0]+'</i>'+c[1]+'</button>').join('')+'</div>':'')+
      (cur.ing?'<label class="ingl">Con un ingreso de $<input id="gaPathiIng" type="number" step="1000" value="'+ING+'"> al mes</label>':'')+
      (cur.fine?'<div class="fine">'+cur.fine+'</div>':'');
    const ii=st.querySelector('#gaPathiIng');if(ii){ii.addEventListener('keydown',e=>e.stopPropagation());ii.addEventListener('change',()=>{ING=Math.max(0,+ii.value||0);$('ingresoMensualCliente').value=ING;$('ingresoMensualCliente').dispatchEvent(new Event('input',{bubbles:true}));GaPresentation.refresh({force:true})})}
    st.querySelectorAll('[data-chip]').forEach(b=>b.onclick=()=>{const i=+b.dataset.chip;chip=chip===i?null:i;paint()});
  }

  // pasos
  const sp=document.getElementById('gaPathsteps');
  sp.innerHTML='<button class="nav" id="gaPathprev" aria-label="Anterior">‹</button>'+
    S.map((s,i)=>'<button class="step'+(step===i+1?' on':step>i+1?' done':'')+'" data-s="'+(i+1)+'"><span class="n">'+(i+1)+'</span><span><b>'+s.k+'</b><small>'+s.sm+'</small></span></button>').join('')+
    '<button class="nav" id="gaPathnext" aria-label="Siguiente">›</button>';
  sp.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>go(step===+b.dataset.s?0:+b.dataset.s));
  document.getElementById('gaPathprev').disabled=step===0;document.getElementById('gaPathnext').disabled=step===S.length;
  document.getElementById('gaPathprev').onclick=()=>go(step-1);document.getElementById('gaPathnext').onclick=()=>go(step+1);

  document.getElementById('gaPathlegend').innerHTML=cur&&cur.wave?'<span><i class="d"></i>Lo que estimamos</span><span><i></i>Cómo se mueve de verdad</span>':'';
  drawChart(d,cur);
}

function drawChart(d,cur){
  const pts=curve(d), wv=wave(pts);
  const max=Math.max(...wv,...pts)*1.12; Y=v=>PT+(H-PT-PB)*(1-v/max);
  const base=Y(0), sx=[];
  // eje y edades
  const ages=(NARROW?[AGE,45,65]:[AGE,40,45,50,AGE+YEARS,60,65]).filter((a,i,arr)=>arr.indexOf(a)===i&&(a===AGE+YEARS||a===AGE||a===65||Math.abs(a-(AGE+YEARS))>2));
  let g='<defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0830E8" stop-opacity=".28"/><stop offset="1" stop-color="#0830E8" stop-opacity=".02"/></linearGradient>'+
        '<clipPath id="hl"><rect x="'+(cur?X(cur.range[0]):0)+'" y="0" width="'+(cur?X(cur.range[1])-X(cur.range[0]):W)+'" height="'+H+'"/></clipPath></defs>';
  g+='<g class="axis">';
  const stepT=max>8e6?2.5e6:max>4e6?1e6:5e5;for(let v=stepT;v<max*.97;v+=stepT){g+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(PL-10)+'" y="'+(Y(v)+4)+'" text-anchor="end" style="font-size:'+(13*F)+'px">$'+(v/1e6).toLocaleString('es-MX')+' M</text>'}
  g+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+base+'" y2="'+base+'" style="stroke:#b8c4d8"/>';
  ages.forEach(a=>{const x=X((a-AGE)*12);g+='<text x="'+x+'" y="'+(base+20*F)+'" text-anchor="'+(a===AGE?'start':a===65?'end':'middle')+'" style="font-size:'+(13*F)+'px">'+a+' años</text>'});
  g+='</g>';
  // franjas de fase bajo el eje
  const ph=[[0,18,'Tu base'],[18,END,NARROW?'Tú decides':'Tú decides · sigues aportando'],[END,TOTAL,NARROW?'Crece':'Sigue creciendo']];
  ph.forEach(([a,b,l],i)=>{const on=cur&&cur.range[0]<b&&cur.range[1]>a&&!cur.wave;const x1=X(a)+1,x2=X(b)-1;
    g+='<rect x="'+x1+'" y="'+(base+(NARROW?44:32))+'" width="'+(x2-x1)+'" height="6" rx="3" fill="'+(on?'#0830E8':'#d6e0f2')+'"/>';
    if(i>0)g+='<text x="'+((x1+x2)/2)+'" y="'+(base+(NARROW?44:32)+22*F)+'" text-anchor="middle" style="font-size:'+(12.5*F)+'px;font-weight:700;fill:'+(on?'#0830E8':'#8a99b3')+'">'+l+'</text>';});
  if(!NARROW)g+='<text x="'+X(0)+'" y="'+(base+54)+'" style="font-size:12.5px;font-weight:700;fill:'+(cur&&cur.range[0]<18&&!cur.wave?'#0830E8':'#8a99b3')+'">Tu base</text>';

  const area=a=>path(a)+'L'+X(TOTAL)+' '+base+'L'+X(0)+' '+base+'Z';
  const dim=cur&&!cur.wave?' opacity=".22"':'';
  // banda de 18 meses
  if(cur&&cur.range[1]===18) g+='<rect x="'+X(0)+'" y="'+(PT+10)+'" width="'+(X(18)-X(0))+'" height="'+(base-PT-10)+'" fill="#0830E8" opacity=".10"/>';
  if(cur&&cur.wave){
    g+='<path d="'+area(wv)+'" fill="url(#ar)"/>';
    g+='<path d="'+path(pts)+'" fill="none" stroke="#7d93d6" stroke-width="2.5" stroke-dasharray="7 6"/>';
    g+='<path d="'+path(wv)+'" fill="none" stroke="#001868" stroke-width="3.5" stroke-linejoin="round"/>';
    // valle más claro en la parte media
    let best=-1,bv=0;for(let m=Math.round(END*.5);m<END-20;m++){const r=wv[m]/pts[m];if(best<0||r<bv){bv=r;best=m}}
    const vx=X(best),vy=Y(wv[best]);
    g+='<circle cx="'+vx+'" cy="'+vy+'" r="7" fill="#0f8a5f" stroke="#fff" stroke-width="3"/>';
    g+='<line x1="'+vx+'" x2="'+vx+'" y1="'+(vy-12)+'" y2="'+(vy-62*F*.7)+'" stroke="#0f8a5f" stroke-width="1.5"/>';
    g+=callout(vx,vy-62*F*.7,NARROW?'Aquí baja: compras más':'Aquí baja: tu aportación compra más',NARROW?'misma aportación':'la misma cantidad, más unidades','center','#0f8a5f');
  }else{
    g+='<g'+dim+'><path d="'+area(pts)+'" fill="url(#ar)"/><path d="'+path(pts)+'" fill="none" stroke="#001868" stroke-width="3.5"/></g>';
    if(cur) g+='<g clip-path="url(#hl)"><path d="'+area(pts)+'" fill="url(#ar)"/><path d="'+path(pts)+'" fill="none" stroke="#0830E8" stroke-width="5"/></g>';
  }
  if(!cur||cur.end){const ex=X(TOTAL),ey=Y(pts[TOTAL]);g+='<circle cx="'+ex+'" cy="'+ey+'" r="8" fill="#0830E8" stroke="#fff" stroke-width="3"/>';
    g+=callout(ex,ey-16,money(calcMensual(d.fondo65))+' al mes','desde los 65','left');}
  if(cur&&cur.range[1]===6){const sx0=X(0),sy=Y(0);g+='<circle cx="'+sx0+'" cy="'+sy+'" r="8" fill="#0830E8" stroke="#fff" stroke-width="3"/>';g+=callout(sx0+14,sy-18,'Hoy: '+money(PMT)+' al mes',dateAt(0),'right');}
  if(cur&&cur.range[1]===18){const x=X(18),y=Y(pts[18]);g+='<circle cx="'+x+'" cy="'+y+'" r="7" fill="#0830E8" stroke="#fff" stroke-width="3"/>';g+=callout(x+14,y-20,'Mes 18: tu base está lista',dateAt(18)+' · se abren tus opciones','right');}
  if(cur&&cur.chips){const x=X(18),y=Y(pts[18]);g+='<circle cx="'+x+'" cy="'+y+'" r="7" fill="#0830E8" stroke="#fff" stroke-width="3"/>';
    const xe=X(END),ye=Y(pts[END]);g+='<circle cx="'+xe+'" cy="'+ye+'" r="7" fill="#0830E8" stroke="#fff" stroke-width="3"/>'+callout(xe-14,ye-18,'Terminas de aportar',dateAt(END)+' · llevas '+mill(d.fondoPlan),'left');}
  if(cur&&cur.refund){for(let y=1;y<=YEARS;y++){const m=y*12-6;g+='<circle cx="'+X(m)+'" cy="'+Y(pts[m])+'" r="5.5" fill="#0f8a5f" stroke="#fff" stroke-width="2"/>'}
    const m=30;g+=callout(X(m)+8,Y(pts[m])-(NARROW?90:22),'+'+money(d.dev1)+' de vuelta',NARROW?'el primer año':'el primer año · cada punto es un año','right','#0f8a5f');}
  if(cur&&cur.at60){const x=X(M60),y=Y(pts[M60]);g+='<line x1="'+x+'" x2="'+x+'" y1="'+y+'" y2="'+base+'" stroke="#0830E8" stroke-dasharray="4 4"/><circle cx="'+x+'" cy="'+y+'" r="8" fill="#0830E8" stroke="#fff" stroke-width="3"/>';
    g+=callout(x-14,y-18,money(calcMensual(d.fondo60))+' al mes','desde los 60 · Art. 93','left');}
  const sv=document.getElementById('gaPathsvg');sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.innerHTML=g;sv.dataset.capital=d.fondo65;sv.dataset.waveEnd=wv.at(-1);host.dataset.source=JSON.stringify(pts);host.dataset.wave=JSON.stringify(wv);
}

function callout(x,y,t,s,side,color){
  const C=NARROW?1.5:1;const w=(Math.max(t.length*8.6,s.length*6.9)+26)*C,h=50*C;
  let rx=side==='left'?x-w:side==='right'?x:x-w/2, ry=side==='below'?y:y-h;
  rx=Math.max(PL,Math.min(W-PR-w,rx));ry=Math.max(4,ry);
  const c=color||'#001868';
  return '<g class="callout"><rect x="'+rx+'" y="'+ry+'" width="'+w+'" height="'+h+'" rx="10" style="stroke:'+c+'"/><text x="'+(rx+13*C)+'" y="'+(ry+21*C)+'" style="fill:'+c+';font-size:'+(15*C)+'px">'+t+'</text><text class="s" x="'+(rx+13*C)+'" y="'+(ry+39*C)+'" style="font-size:'+(12.5*C)+'px">'+s+'</text></g>';
}

function go(n){const L=stepsFor().length;step=Math.max(0,Math.min(L,n));chip=null;paint()}
document.addEventListener('keydown',e=>{if(!$('gaLienzo')?.hidden||!host.offsetParent||host.hidden||$('gaPane-projection').hidden||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(step+(e.key==='ArrowRight'?1:-1))}});
function render(){
 const classic=window.GA_FLOW_CLASSIC===true;host.hidden=classic;
 if(classic){graphAnchor.after(originalGraph);return}else $('gaPane-gap').append(originalGraph);
 // Las opciones de arranque viven junto a la meta y la brecha: Tu proyección queda solo para Tu camino.
 // La tarjeta del Acto 2 queda oculta en esta vista: sus controles (modo celular, ir a la decisión, copiar resumen) pasan a la cabecera de la calculadora.
 const headRow=document.querySelector('.calculator-heading');if(headRow){let tools=$('gaPathTools');if(!tools){tools=document.createElement('div');tools.id='gaPathTools';tools.className='ga-path-tools';headRow.append(tools)}for(const id of ['gaThreeMobileToggle','gaActDecision','gaActCopy']){const b=$(id);if(b&&b.parentElement!==tools){b.className='btn-light';tools.append(b)}}}
 const projPane=$('gaPane-projection');if(projPane&&projPane.firstElementChild!==host)projPane.prepend(host);
 const opts=$('gaActOptions'),gapPane=$('gaPane-gap');if(opts&&gapPane&&opts.parentElement!==gapPane){(gapPane.querySelector('#gaProjectionGap')||gapPane.lastElementChild).after(opts)}
 if(typeof chart==='undefined'||!chart||!reportState.fondo65)return;
 AGE=Number($('edad').value);PMT=Number($('pmt').value);YEARS=reportState.planYears;TOTAL=Math.round((65-AGE)*12);END=Math.round(YEARS*12);M60=Math.round((60-AGE)*12);
 reg=$('regimenFiscal').value;REINV=$('reinvertISR').checked;ING=Number($('ingresoMensualCliente').value)||0;
 DATA[reg]={...reportState,dev1:reportState.devolucionFiscalPrimerAnoVista,impacto65:reportState.impactoISR65};
 // Modo celular: la tarjeta "Tu camino" muestra los 4 hitos en texto grande (sin gráfica).
 const mob=$('gaMobilePath');if(mob){const d=DATA[reg],rows=[['Hoy · empiezas con '+money(PMT)+' al mes',dateAt(0)+' · '+AGE+' años'],['Mes 18 · tu base está lista: se abren tus opciones',dateAt(18)],['Terminas de aportar · llevas '+money(d.fondoPlan),dateAt(END)+' · '+(AGE+YEARS)+' años'],['65 años · empiezas a recibir '+money(d.ingreso65)+' al mes',dateAt(TOTAL)+' · 65 años']];
  mob.lastElementChild.replaceChildren(...rows.map((r,i)=>{const s=document.createElement('section');const h=document.createElement('b');h.textContent=(i+1)+'. '+r[0];const q=document.createElement('p');q.textContent=r[1];s.append(h,q);return s}))}
 step=Math.min(step,stepsFor().length);geometry();paint();
}
window.GaPath={render,go,curve,wave,getStep:()=>step};
document.addEventListener('ga:projection-updated',render);window.addEventListener('resize',render);
})();

/* Implementación ronda 2 conservada (sin ejecutar):
 Display geometry only. Financial amounts are read from the existing report and chart.
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

*/
