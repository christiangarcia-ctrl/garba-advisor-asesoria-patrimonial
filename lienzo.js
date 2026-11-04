/* Ronda 4. Presentation adapted verbatim from docs/maqueta/lienzo.html. */
(function(){
'use strict';
const root=document.createElement('section');root.id='gaLienzo';root.hidden=true;root.innerHTML='\n<div class="top">\n  <img src="img/logo-garba.png" alt="GarBa">\n  <div class="who"><b id="tName">Tu plan de retiro</b><span>Asesoría con Christian García · Distribuidor autorizado Allianz</span></div>\n  <div class="acts" id="acts"></div>\n  <button class="duda" id="duda">¿Tienes una duda?</button>\n  <details id="lMenu"><summary aria-label="Menú del asesor">⋯</summary><div class="menu" id="lMenuItems"></div></details>\n</div>\n<main class="stage">\n  <aside class="side" id="side"></aside>\n  <section class="canvas">\n    <div class="headrow">\n      <div class="why" id="why"></div>\n      <div class="hero" id="hero"></div>\n    </div>\n    <div class="chart"><div class="legend" id="legend"></div><svg id="svg" aria-label="Tu retiro"></svg>\n      <div class="disc">Gráfica ilustrativa, sin escala de rendimiento ni garantía de crecimiento. Las inversiones pueden apreciarse o depreciarse.</div></div>\n    <div class="steps" id="steps"></div>\n  </section>\n</main>\n';document.body.append(root);

// ===================== estado =====================
const money=v=>'$'+Math.round(v).toLocaleString('es-MX');
const mill=v=>v<1e6?money(v):'$'+(v/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' millones';
const calcMensual=f=>f===D?.fondo65?reportState.ingreso65:reportState.ingreso60;
const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const START=new Date();
const dateAt=m=>{const d=new Date(START);d.setMonth(d.getMonth()+m);return MESES[d.getMonth()]+' '+d.getFullYear()};
const minPmt=y=>y<=14?3000:2000;

// Responses always live in the original inputs. Only navigation belongs to this layer.
const fields={nombre:'gaName',edad:'gaAge',meta:'gaWhy',porque:'gaMeaning',condicion:'gaConcern',freno:'gaBarrier',metaHoy:'gaGoal',pmt:'gaPmt',years:'years',reg:'gaTax',ing:'gaIngresoMensual',reinv:'gaReinvertISR'};
const numeric=new Set(['edad','metaHoy','pmt','years','ing']);
const nav={pdp:false,act:1,q:'hola',step:0,chip:null,dec:null,duda:false,drawnOnce:false};
function original(id){return document.getElementById(id)}
function emit(id,v){const e=original(id);if(!e)return;if(id==='gaTax'&&v==='ninguno'&&![...e.options].some(o=>o.value===v)){e.add(new Option('Sin beneficio fiscal',v))}if(e.type==='checkbox')e.checked=!!v;else e.value=v??'';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}
function optionNodes(k){if(k==='dolor')return [...document.querySelectorAll('#gaPriorityOptions [data-value]')];return [...document.querySelectorAll('.ga-preset-row[data-target="'+fields[k]+'"] [data-fill]')]}
function read(k){
 if(k==='dolor')return window.GaShell?.priorities[0]||'';
 const e=original(fields[k]);if(!e)return '';const v=e.type==='checkbox'?e.checked:e.value;return numeric.has(k)?(v===''?null:Number(v)):v;
}
function displayAnswer(k){const v=read(k);const b=optionNodes(k).find(b=>(b.dataset.fill||b.dataset.value)===v);return b?(b.querySelector('strong')?.textContent||b.textContent).trim():v;}
const S=new Proxy(nav,{get:(o,k)=>k in fields||k==='dolor'?read(k):o[k],set:(o,k,v)=>{
 if(k==='dolor'||['meta','porque','condicion','freno'].includes(k)){
 const b=optionNodes(k).find(b=>(b.querySelector('strong')?.textContent||b.textContent).trim()===v||b.dataset.fill===v||b.dataset.value===v);
 if(b)b.click();else if(k==='dolor'){original('gaPriorityOtherBtn')?.click();emit('gaPriorityOther',v)}else emit(fields[k],v);
 }else if(k in fields){emit(fields[k],v);const mirror={edad:'edad',metaHoy:'metaHoy',pmt:'pmt',reg:'regimenFiscal',ing:'ingresoMensualCliente',reinv:'reinvertISR'}[k];if(mirror)emit(mirror,v)}else o[k]=v;
 window.GaShell?.schedulePersist?.();return true;
}});
// ===================== preguntas del acto 1 (mismas opciones que hoy) =====================
const Q=[
 {k:'edad',label:'Edad',t:'Para empezar, <em>¿cuántos años tienes?</em>',num:true,unit:'años',ph:'36'},
 {k:'dolor',label:'Te preocupa',t:'¿Qué te gustaría <em>resolver</em>?',opts:[['Mi AFORE podría no alcanzar','Quiero una fuente adicional de ingreso.'],['No tengo una ruta formal de retiro','Trabajo por mi cuenta o he cotizado irregular.'],['No quiero trabajar por obligación','Que trabajar sea una elección.'],['Proteger a mi familia','Contemplar a quienes dependen de mí.']]},
 {k:'meta',label:'Quieres',t:'¿Qué te gustaría <em>conseguir</em>?',opts:[['Tener ingresos adicionales'],['Mantener mi nivel de vida'],['Trabajar por elección'],['Proteger a mi familia']]},
 {k:'porque',label:'Por qué ahora',t:'¿Por qué es importante <em>empezar ahora</em>?',opts:[['No depender de mis hijos'],['Aprovechar el tiempo'],['Hoy tengo capacidad'],['Dejar de improvisar']]},
 {k:'condicion',label:'No puede faltar',t:'¿Qué tiene que respetar tu plan para que <em>sí te funcione</em>?',opts:[['Flexibilidad y acceso'],['Seguridad y respaldo'],['Beneficio fiscal'],['Rendimiento y riesgo']]},
 {k:'freno',label:'Te había frenado',t:'¿Qué te había <em>frenado</em> hasta hoy?',opts:[['Temor a comprometerme'],['Prioricé otros gastos'],['No encontraba una propuesta adecuada'],['Estuve a punto de contratar uno']]},
 {k:'metaHoy',label:'Te gustaría recibir',t:'¿Cuánto te gustaría <em>recibir al mes</em> en tu retiro?',num:true,unit:'al mes, en pesos de hoy',ph:'30000',money:true},
 {k:'pmt',label:'Puedes apartar',t:'¿Cuánto puedes <em>apartar cada mes</em> sin apretarte?',num:true,unit:'al mes',ph:'3000',money:true,fine:'Sin forzar tu presupuesto: primero un escenario que sí puedas sostener.'},
];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtAns=(q,v)=>v==null||v===''?'':q.k==='edad'?v+' años':q.money?money(v):esc(v);

// Read the existing calculation engine, never a second simulation.
let D=null,busy=false;
function maxYears(){return [10,15,20,25]} // plazos permitidos; el motor deja de sumar aportaciones a los 65
const yearsLabel=y=>y+' años'+(S.edad&&S.edad+y>65?' · cuenta hasta los 65':'');
function recalc(){
 if(busy)return;busy=true;
 try{
 if(S.edad&&S.pmt){
  emit('edad',S.edad);const ok=maxYears();if(ok.length&&!ok.includes(Number(S.years)))emit('years',ok.at(-1));
  emit('pmt',S.pmt);if(S.metaHoy)emit('metaHoy',S.metaHoy);
  window.calcAccum();window.updateSuggestion?.();
  D={...reportState,dev1:reportState.devolucionFiscalPrimerAnoVista,impacto65:reportState.impactoISR65,sug:reportState.pmtSugerido,infl:reportState.infl};
 }else D=null;
 }finally{busy=false}render();
}
// ===================== render =====================
const $=id=>root.querySelector('#'+id);
function render(){renderTop();renderSide();renderCanvas();document.dispatchEvent(new Event('ga:lienzo-state'))}

function renderTop(){
  $('tName').textContent=S.nombre?'El plan de retiro de '+S.nombre:'Tu plan de retiro';
  const A=[['Tu porqué'],['Tu número'],['Tu decisión']];
  $('acts').innerHTML=A.map((a,i)=>'<button class="act'+(S.act===i+1?' on':S.act>i+1?' done':'')+'" data-a="'+(i+1)+'"><i>'+(S.act>i+1?'✓':i+1)+'</i>'+a[0]+'</button>').join('');
  $('acts').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>goAct(+b.dataset.a));
  $('duda').classList.toggle('on',S.duda);
}
function goAct(a){
  if(a>1&&!(S.edad&&S.pmt)){ // atajo: sin datos todavía, se piden ahí mismo
    S.pendingAct=a;S.act=1;S.q=!S.edad?0:7;S.duda=false;render();return}
  S.act=a;S.duda=false;S.step=0;S.chip=null;if(a>1&&!original('resultsView').classList.contains('active'))window.GaShell.openProposal();render();
}

// ---------- columna izquierda ----------
function hist(){
  const items=Q.filter(q=>S[q.k]!=null&&S[q.k]!=='');
  if(!items.length)return'';
  return '<div class="hist">'+items.map(q=>'<button data-edit="'+Q.indexOf(q)+'"><span>'+q.label+'</span><b>'+fmtAns(q,displayAnswer(q.k)??S[q.k])+'</b></button>').join('')+'</div>';
}
function renderSide(){
  const sd=$('side');let h='';
  if(S.duda){h=dudaHTML()}
  else if(S.act===1){
    if(S.q==='hola'){
      h='<div class="kicker">Bienvenida</div><h2>Hoy vamos a <em>dibujar tu retiro</em>, juntos.</h2>'+
        '<div class="path3"><div><i>1</i>Entendemos qué quieres resolver</div><div><i>2</i>Vemos tu número</div><div><i>3</i>Decides el siguiente paso</div></div>'+
        '<p class="lead">Cada respuesta va construyendo tu gráfica, ahí a la derecha.</p>'+
        '<button class="me" id="credentials"><img src="img/foto-credencial-christian.jpg" alt=""><div><b>Christian García</b><span>Asesor autorizado CNSF · Cédula G384982<br>Distribuidor autorizado Allianz</span></div></button>'+
        (original('gaImportSession')?'<button class="link" id="resumeLink">¿Retomas una sesión guardada?</button>':'')+'<div class="grow"></div><button class="go" id="start">Empecemos →</button>';
    }else if(S.q==='resumen'){
      h='<div class="kicker">'+(S.pdp?'Punto de partida':'Esto es lo que entendí')+'</div><h2>'+(S.pdp?(S.nombre?esc(S.nombre)+', esto ':'Esto ')+'es lo que <em>ya me contaste</em>.':'Esto es lo que <em>entendí de ti</em>.')+'</h2>'+
        '<p class="lead" style="margin-bottom:14px">'+(S.pdp?'Con eso ya dibujamos tu retiro. ¿Sigue siendo así?':'¿Te representa?')+'</p>'+hist()+
        '<div class="grow"></div><button class="go" id="toNum">Sí, así es · ver mi número →</button><button class="link" id="fix">Quiero ajustar algo</button>';
    }else{
      const q=Q[S.q],n=Q.length;
      h='<div class="kicker">Tu porqué · '+(S.q+1)+' de '+n+'</div>'+hist()+'<h2>'+q.t+'</h2>';
      if(q.opts)h+='<div class="opts">'+q.opts.map(o=>'<button class="opt'+(S[q.k]===o[0]?' on':'')+'" data-o="'+o[0]+'">'+o[0]+(o[1]?'<small>'+o[1]+'</small>':'')+'</button>').join('')+'</div>';
      if(q.opts)h+='<button class="link" id="other">'+(q.k==='dolor'?'Otro':'Otra respuesta')+'</button><div id="otherField" hidden><input id="otherText" type="text" aria-label="Otra respuesta"><button class="go" id="otherOk">Listo →</button></div>'+(q.k==='dolor'?'<label class="fine">¿Por qué te preocupa esto? (opcional)<input id="priorityWhy" type="text" value="'+esc(original('gaPriorityWhy').value)+'"></label>':'');
      if(q.num)h+='<label class="big">'+(q.money?'$':'')+'<input id="qn" type="number" inputmode="numeric" placeholder="'+q.ph+'" value="'+(S[q.k]??'')+'"><span>'+q.unit+'</span></label>'+(q.fine?'<p class="fine">'+q.fine+'</p>':'')+'<button class="go" id="qok">Listo →</button>';
      h+='<div class="grow"></div><button class="link" id="skip">Ir directo a tu número →</button>';
    }
  }else if(S.act===2){h=numSide()}
  else h=decSide();
  restoreNodes();sd.innerHTML=h;wireSide();mountOriginals();
}
function wireSide(){
  const sd=$('side');
  sd.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{S.act=1;S.q=+b.dataset.edit;render()});
  if($('other'))$('other').onclick=()=>{$('otherField').hidden=false;$('otherText').focus()};
  if($('otherOk'))$('otherOk').onclick=()=>{if(!$('otherText').value.trim())return;S[Q[S.q].k]=$('otherText').value.trim();nextQ()};
  if($('priorityWhy'))$('priorityWhy').oninput=e=>emit('gaPriorityWhy',e.target.value);
  if($('credentials'))$('credentials').onclick=()=>original('gaOpenCredentials')?.click();
  if($('resumeLink'))$('resumeLink').onclick=()=>{original('gaImportSession')?.click()};
  if($('start'))$('start').onclick=()=>{S.q=-1;nextQ()}; // salta lo ya contestado (Punto de Partida o sesión retomada)
  if($('toNum'))$('toNum').onclick=()=>{window.GaShell.setConfirmed(true);window.GaShell.diagnosisChecks.ready='No';document.querySelector('[data-diagnosis-check="ready"][data-value="No"]')?.click();window.GaShell.openProposal();goAct(2)};
  if($('fix'))$('fix').onclick=()=>{S.q=0;render()};
  if($('skip'))$('skip').onclick=()=>goAct(2);
  sd.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const q=Q[S.q];S[q.k]=b.dataset.o;render();setTimeout(nextQ,280)});
  const qn=$('qn');if(qn){qn.focus();const ok=()=>{const v=+qn.value;if(!v)return;const q=Q[S.q];if(q.k==='edad'&&(v<18||v>=65)){qn.setCustomValidity('Captura una edad entre 18 y 64 años.');qn.reportValidity();return}S[q.k]=v;nextQ(true)};
    $('qok').onclick=ok;qn.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')ok()}}
  // acto 2
  sd.querySelectorAll('[data-chip]').forEach(b=>b.onclick=()=>{const i=+b.dataset.chip;S.chip=S.chip===i?null:i;render()});
  const bind=(id,k,num)=>{const e=$(id);if(!e)return;e.onkeydown=ev=>ev.stopPropagation();e.onchange=()=>{S[k]=num?+e.value:e.value;recalc()}};
  bind('cPmt','pmt',1);bind('cYrs','years',1);bind('cReg','reg');bind('iIng','ing',1);bind('cMeta','metaHoy',1);
  if($('cReinv'))$('cReinv').onchange=e=>{S.reinv=e.target.checked;recalc()};
  if($('toDec'))$('toDec').onclick=()=>goAct(3);
  // acto 3
  sd.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{S.dec=S.dec===b.dataset.dec?null:b.dataset.dec;if(S.dec)document.querySelector('[data-postcalc="decision"][data-value="'+({hoy:'today',agendar:'schedule',pensar:'think'}[S.dec])+'"]')?.click();render()});
  if($('back'))$('back').onclick=()=>{S.duda=false;render()};
  sd.querySelectorAll('[data-dq]').forEach(b=>b.onclick=()=>{S.dq=+b.dataset.dq<0?null:+b.dataset.dq;render()});
}
function nextQ(){
  if(S.pendingAct){if(!S.edad||!S.pmt){S.q=!S.edad?0:7;recalc();return}const a=S.pendingAct;S.pendingAct=null;recalc();goAct(a);return}
  const i=typeof S.q==='number'?S.q:0;
  const nx=Q.findIndex((q,j)=>j>i&&(S[q.k]==null||S[q.k]===''));
  S.q=nx<0?'resumen':nx;recalc();
}

// ---------- acto 2: tu número ----------
const CHIPS=[['Ⅱ','Pausar','¿Un mal año? Puedes pausar hasta 12 meses.'],['+','Aportar más','¿Te sobró dinero? Lo puedes meter cuando quieras.'],['↑','Subir tu aportación','¿Ganas más? Aumentas lo que aportas.'],['↓','Sacar una parte','Puedes hacer retiros parciales. Aplican condiciones.'],['⌂','Pedir prestado','Hasta 50% de tu saldo comprometido en alternativas conservadoras, sujeto a aprobación de Allianz y a las condiciones del contrato.']];
function stepsFor(){
  if(!D)return[];
  const TOTAL=(65-S.edad)*12,END=Math.min(S.years*12,TOTAL),M60=(60-S.edad)*12;
  const s=[
   {k:'Empiezas',sm:dateAt(0)+' · '+S.edad+' años',range:[0,6],t:'Hoy empiezas con <em>'+money(S.pmt)+'</em> al mes.',p:'Es lo único que decides hoy. Lo demás lo hace el tiempo.'},
   {k:'Tu base',sm:'Mes 1 al 18',range:[0,18],t:'Los primeros <em>18 meses</em> armas tu base.',p:'Tu constancia puede ser reconocida con un bono, sujeto a las condiciones del plan. En '+dateAt(18)+' ya se abren tus opciones.'},
   {k:'Sube y baja',sm:'Toda la inversión',range:[0,TOTAL],wave:true,t:'Tu dinero está invertido: <em>sube y baja</em>.',p:'Cuando baja, tu misma aportación compra más. Lo que cuenta es el camino completo, no un mes.'},
   {k:'Tú decides',sm:'Desde el mes 19',range:[18,END],chips:true,t:'Después del mes 18, <em>tú decides</em>.',p:'Toca una opción:'},
  ];
  if(S.reg==='151')s.push({k:'Te devuelven',sm:'Cada año, al declarar',range:[0,END],refund:true,t:'Cada año te <em class="g">devuelven impuestos</em>.',
    p:S.reinv?'Unos <b>'+money(D.dev1)+'</b> el primer año. Como los vuelves a meter al plan, <b>'+mill(D.impacto65)+'</b> de lo que juntas a los 65 vienen de ahí.':'Unos <b>'+money(D.dev1)+'</b> el primer año, para ti. Si los metes al plan, tu retiro crece todavía más.',
    ing:true,fine:'Deducción sujeta a límites y requisitos fiscales; depende de tu situación como contribuyente.'});
  else if(S.reg==='93')s.push({k:'Desde los 60',sm:dateAt(M60)+' · 60 años',range:[M60-4,M60+4],at60:true,t:'Desde los 60 ya puedes <em>empezar a recibir</em>.',
    p:'Unos <b>'+money(calcMensual(D.fondo60))+'</b> al mes. Puede salir libre de impuestos si llevas 5 años en el plan.',fine:'El beneficio depende de la modalidad, los requisitos aplicables y la legislación vigente.'});
  s.push({k:'Tu retiro',sm:dateAt(TOTAL)+' · 65 años',range:[END,TOTAL],end:true,t:'A los 65 recibes <em>'+money(calcMensual(D.fondo65))+'</em> al mes.',
    p:(S.edad+S.years<65?'Dejas de aportar a los '+(S.edad+S.years)+' y tu dinero sigue creciendo hasta los 65: juntas <b>':'Aportas hasta los 65 y juntas <b>')+mill(D.fondo65)+'</b>.',fine:'Es una estimación. El dinero de '+(START.getFullYear()+65-S.edad)+' no vale lo mismo que el de hoy.'});
  return s;
}
function numSide(){
  const St=stepsFor(),cur=S.step?St[S.step-1]:null;let h;
  if(!cur)h='<div class="kicker">Tu número</div><h2>Así se construye <em>tu retiro</em>, paso a paso.</h2><p class="lead">Toca el primer paso abajo o usa las flechas.</p>';
  else{let p=cur.p;
    if(cur.chips&&S.chip!=null){const c=CHIPS[S.chip];p=c[2]+(S.chip===3?' <span style="color:var(--muted)">'+(S.reg==='151'?'Para que salga libre de impuestos, retira desde los 65 (hasta 15 UMAs al año).':'Para que salga libre de impuestos, retira desde los 60 y con 5 años en el plan.')+'</span>':'')}
    h='<div class="kicker">Paso '+S.step+' de '+St.length+'</div><h2>'+cur.t+'</h2><p class="lead">'+p+'</p>'+
      (cur.chips?'<div class="chips">'+CHIPS.map((c,i)=>'<button class="chip'+(S.chip===i?' on':'')+'" data-chip="'+i+'">'+c[0]+' '+c[1]+'</button>').join('')+'</div>':'')+
      (cur.ing?'<label class="ingl">Con un ingreso de $<input id="iIng" type="number" step="1000" value="'+S.ing+'"> al mes</label>':'')+
      (cur.fine?'<p class="fine">'+cur.fine+'</p>':'');}
  const bad=S.pmt<minPmt(S.years);
  h+='<div class="grow"></div><div class="ctls">'+
    '<label class="ctl'+(bad?' bad':'')+'">Aportas al mes<input id="cPmt" type="number" step="500" value="'+S.pmt+'"><span class="w">Mínimo '+money(minPmt(S.years))+' con '+(S.years<=14?'10 a 14':'15 a 25')+' años</span></label>'+
    '<label class="ctl">Durante<select id="cYrs">'+maxYears().map(y=>'<option value="'+y+'"'+(y==S.years?' selected':'')+'>'+yearsLabel(y)+'</option>').join('')+'</select></label>'+
    '<label class="ctl">Régimen<select id="cReg"><option value=""'+(!S.reg?' selected':'')+'>Selecciona tu régimen</option><option value="151"'+(S.reg==='151'?' selected':'')+'>Art. 151</option><option value="93"'+(S.reg==='93'?' selected':'')+'>Art. 93</option><option value="ninguno"'+(S.reg==='ninguno'?' selected':'')+'>Sin beneficio fiscal</option></select></label>'+
    '<label class="ctl">Meta al mes (hoy)<input id="cMeta" type="number" step="1000" value="'+(S.metaHoy||'')+'"></label>'+
    (S.reg==='151'?'<label class="chk"><input id="cReinv" type="checkbox"'+(S.reinv?' checked':'')+'>Reinvertir la devolución</label>':'')+
    '</div><button class="go" id="toDec" style="margin-top:12px">Siguiente: tu decisión →</button>';
  return h;
}

// ---------- acto 3: tu decisión ----------
function decSide(){
 const O=[['hoy','Iniciar hoy','Abrimos tu plan juntos, ahora.'],['agendar','Agendar la apertura','Elegimos el día para abrirlo.'],['pensar','Necesito pensarlo','Acordamos cuándo te busco.']];
 return '<div class="kicker">Tu decisión</div><h2>¿Cómo quieres <em>seguir</em>?</h2><p class="lead">Con '+money(S.pmt)+' al mes, a los 65 recibirías '+(D?money(calcMensual(D.fondo65)):'—')+' al mes.</p><div class="dec">'+O.filter(o=>!S.dec||S.dec===o[0]).map(o=>'<button class="opt'+(S.dec===o[0]?' on':'')+'" data-dec="'+o[0]+'">'+o[1]+'<small>'+o[2]+'</small></button>').join('')+'</div><div id="decisionFields"></div>'+(S.dec?'<button class="link" data-dec="'+S.dec+'">← Ver las otras opciones</button>':'');
}

// ---------- dudas (biblioteca) ----------
const DUDAS=['¿Qué pasa si necesito el dinero o dejo de pagar?','¿Es seguro? ¿Quién respalda?','¿Cómo funciona un PPR?','¿Cómo funciona el Art. 151?','¿Cómo funciona el Art. 93?','¿Y la volatilidad?','¿Cómo se abre?'];
function dudaHTML(){
  if(S.dq!=null)return '<div class="kicker">Tu duda</div><h2>'+DUDAS[S.dq]+'</h2><div id="responseBody"></div><div class="grow"></div><button class="link" data-dq="-1" id="dqb">← Otras dudas</button><button class="go" id="back">Volver a donde íbamos</button>';
  return '<div class="kicker">¿Tienes una duda?</div><h2>Resolvámosla <em>aquí mismo</em>.</h2><div class="opts">'+DUDAS.map((d,i)=>'<button class="opt" data-dq="'+i+'">'+d+'</button>').join('')+'</div><div class="grow"></div><button class="go" id="back">Volver a donde íbamos</button>';
}

// ---------- lienzo derecho ----------
const WHY={'No depender de mis hijos':'para no depender de mis hijos','Aprovechar el tiempo':'aprovechando el tiempo','Hoy tengo capacidad':'porque hoy tengo capacidad','Dejar de improvisar':'para dejar de improvisar'};
function renderCanvas(){
  document.getElementById('gaLienzo')?.classList.toggle('l-reading',!!(S.duda&&S.dq!=null&&S.dq>=0));
  // tu porqué
  const w=$('why');
  if(S.meta||S.porque){const a=esc(displayAnswer('meta')||''),why=displayAnswer('porque'),b=why?esc(WHY[why]||why.toLowerCase()):'';
    w.innerHTML='<div class="kicker">Tu porqué</div><q>'+(a&&b?a+', '+b:a||b.charAt(0).toUpperCase()+b.slice(1))+'.</q>'}
  else if(S.dolor)w.innerHTML='<div class="kicker">Lo que quieres resolver</div><q>'+esc(displayAnswer('dolor'))+'.</q>';
  else w.innerHTML='<div class="kicker">Tu porqué</div><div class="ghost">Aquí va lo que te mueve a hacer esto.</div>';
  // cifra
  const he=$('hero');
  if(D&&S.act>=2){he.className='hero';
    // Tres momentos del plan, en orden: terminas de aportar, 60 y 65 (la meta y su brecha viven en «Tu meta y la brecha»)
    const fin=Math.min(65,S.edad+Number(S.years)),yearAt=a=>START.getFullYear()+a-S.edad;
    const cells=[];if(S.edad<60)cells.push([60,'A los 60',D.fondo60]);cells.push([65,'A los 65',D.fondo65]);
    if(!cells.some(c=>c[0]===fin))cells.push([fin,'Terminas de aportar',D.fondoPlan]); // si termina justo a los 60 o 65, no se repite
    cells.sort((x,y)=>x[0]-y[0]);
    he.innerHTML='<small>A los 65 recibes</small><b>'+money(calcMensual(D.fondo65))+'</b><span>al mes · estimado</span><div class="moments">'+cells.map(([a,l,v])=>'<div><em>'+l+'</em><strong>'+mill(v)+'</strong><i>'+a+' años · '+yearAt(a)+'</i></div>').join('')+'</div>'}
  else{he.className='hero empty';he.innerHTML='<small>A los 65 recibes</small><b>'+(S.metaHoy?'Tu meta: '+money(S.metaHoy)+' al mes':'Tu cifra aparece aquí')+'</b><span>'+(D?'al ver tu número':S.edad?'en cuanto sepamos cuánto puedes apartar':'')+'</span>'}
  // pasos (solo en el acto 2)
  const sp=$('steps'),St=S.act===2&&!S.duda?stepsFor():[];
  sp.style.display=St.length?'':'none';sp.style.setProperty('--n',St.length);
  if(St.length){sp.innerHTML='<button class="nav" id="prev">‹</button>'+St.map((s,i)=>'<button class="step'+(S.step===i+1?' on':S.step>i+1?' done':'')+'" data-s="'+(i+1)+'"><span class="n">'+(i+1)+'</span><span><b>'+s.k+'</b><small>'+s.sm+'</small></span></button>').join('')+'<button class="nav" id="next">›</button>';
    sp.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>goStep(S.step===+b.dataset.s?0:+b.dataset.s));
    $('prev').disabled=S.step===0;$('next').disabled=S.step===St.length;$('prev').onclick=()=>goStep(S.step-1);$('next').onclick=()=>goStep(S.step+1)}
  requestAnimationFrame(drawChart);
}
function goStep(n){const L=stepsFor().length;S.step=Math.max(0,Math.min(L,n));S.chip=null;render()}
document.addEventListener('keydown',e=>{if(/INPUT|SELECT/.test(e.target.tagName)||S.act!==2||S.duda)return;if(e.key==='ArrowRight')goStep(S.step+1);if(e.key==='ArrowLeft')goStep(S.step-1)});

// ===================== gráfica =====================
let W,H,PL=74,PR=36,PT=44,PB=64,TOTAL,END,X,Y;
function curve(){
 const source=[Number(original('lumpSum').value)||0,...chart.data.datasets[0].data.map(Number)];
 const pts=Array.from({length:TOTAL+1},(_,m)=>{const pos=m/12,k=Math.min(source.length-2,Math.floor(pos));return source[k]+(source[k+1]-source[k])*(pos-k)});
 pts[END]=D.fondoPlan;pts[TOTAL]=D.fondo65;return pts;
}
function wave(pts){return pts.map((v,m)=>{const t=m/TOTAL,env=Math.sin(Math.PI*t)**.8,n=.55*Math.sin(m/11+.4)+.32*Math.sin(m/4.7+1.3)+.22*Math.sin(m/27+2.1)+.12*Math.sin(m/2.3);
  const c=Math.round(END*.62),dd=m>c-14&&m<c+16?-.13*Math.sin(Math.PI*(m-(c-14))/30):0;return m===TOTAL?v:Math.max(0,v*(1+.13*env*n+dd))})}
function callout(x,y,t,s,side,color){const w=Math.max(t.length*8.6,s.length*6.9)+26,h=50;let rx=side==='left'?x-w:side==='right'?x:x-w/2,ry=y-h;rx=Math.max(PL,Math.min(W-PR-w,rx));ry=Math.max(4,ry);const c=color||'#001868';
  return '<g class="callout"><rect x="'+rx+'" y="'+ry+'" width="'+w+'" height="'+h+'" rx="10" style="stroke:'+c+'"/><text x="'+(rx+13)+'" y="'+(ry+21)+'" style="fill:'+c+'">'+t+'</text><text class="s" x="'+(rx+13)+'" y="'+(ry+39)+'">'+s+'</text></g>'}
function drawChart(){
  const sv=$('svg'),box=sv.getBoundingClientRect();W=Math.max(300,Math.round(box.width));H=Math.max(200,Math.round(box.height));sv.setAttribute('viewBox','0 0 '+W+' '+H);
  const age=S.edad||null;TOTAL=age?(65-age)*12:360;END=Math.min(S.years*12,TOTAL);X=m=>PL+(W-PL-PR)*m/TOTAL;
  const base=H-PB;let g='';$('legend').innerHTML='';
  if(!D||S.act<2){ // lienzo en blanco: la cifra y la curva se revelan al entrar a «Tu número»
    Y=v=>base;g+='<g class="axis"><line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+base+'" y2="'+base+'" style="stroke:#b8c4d8"/>';
    if(age){g+='<text x="'+X(0)+'" y="'+(base+22)+'">Hoy · '+age+' años</text><text x="'+X(TOTAL)+'" y="'+(base+22)+'" text-anchor="end">65 años</text>';
      g+='<text x="'+((PL+W-PR)/2)+'" y="'+(base+22)+'" text-anchor="middle" style="font-weight:800;fill:#0830E8">'+(65-age)+' años para construir tu retiro</text>';
      g+='<circle cx="'+X(0)+'" cy="'+base+'" r="8" fill="#0830E8" stroke="#fff" stroke-width="3"/><circle cx="'+X(TOTAL)+'" cy="'+base+'" r="8" fill="#fff" stroke="#0830E8" stroke-width="3"/>'}
    g+='</g><text x="'+((PL+W-PR)/2)+'" y="'+(PT+(base-PT)/2)+'" text-anchor="middle" style="font-size:22px;font-weight:700;fill:#c3cde0">'+(age?'Aquí vamos a dibujar tu retiro':'Empecemos por tu edad')+'</text>';
    sv.innerHTML=g;return}
  const St=S.act===2&&!S.duda?stepsFor():[],cur=S.step?St[S.step-1]:null;
  const pts=curve(),wv=wave(pts),max=Math.max(...wv,...pts)*1.15;Y=v=>PT+(base-PT)*(1-v/max);
  const path=a=>a.map((v,m)=>(m?'L':'M')+X(m).toFixed(1)+' '+Y(v).toFixed(1)).join('');
  g+='<defs><linearGradient id="lzAr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0830E8" stop-opacity=".28"/><stop offset="1" stop-color="#0830E8" stop-opacity=".02"/></linearGradient>'+
     '<clipPath id="lzHl"><rect x="'+(cur?X(cur.range[0]):0)+'" y="0" width="'+(cur?X(cur.range[1])-X(cur.range[0]):W)+'" height="'+H+'"/></clipPath></defs><g class="axis">';
  const stepT=max>8e6?2.5e6:max>4e6?1e6:max>1.5e6?5e5:2.5e5;for(let v=stepT;v<max*.97;v+=stepT)g+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(PL-10)+'" y="'+(Y(v)+4)+'" text-anchor="end">$'+(v/1e6).toLocaleString('es-MX')+' M</text>';
  g+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+base+'" y2="'+base+'" style="stroke:#b8c4d8"/>';
  const ages=[age,Math.min(65,age+S.years),60,65].filter((a,i,arr)=>arr.indexOf(a)===i&&a<=65&&(i<2||Math.abs(a-(age+S.years))>2));
  ages.forEach(a=>g+='<text x="'+X((a-age)*12)+'" y="'+(base+20)+'" text-anchor="'+(a===age?'start':a===65?'end':'middle')+'">'+(a===age?'Hoy · ':'')+a+' años</text>');
  g+='</g>';
  // franja de fases bajo el eje
  [[0,18,'Tu base'],[18,END,'Tú decides · sigues aportando'],[END,TOTAL,'Sigue creciendo']].forEach(([a,b,l],i)=>{if(b<=a)return;const on=cur&&cur.range[0]<b&&cur.range[1]>a&&!cur.wave;const x1=X(a)+1,x2=X(b)-1;
    g+='<rect x="'+x1+'" y="'+(base+32)+'" width="'+(x2-x1)+'" height="6" rx="3" fill="'+(on?'#0830E8':'#d6e0f2')+'"/><text x="'+(i?(x1+x2)/2:x1)+'" y="'+(base+54)+'" text-anchor="'+(i?'middle':'start')+'" style="font-size:12.5px;font-weight:700;fill:'+(on?'#0830E8':'#8a99b3')+'">'+l+'</text>'});
  const area=a=>path(a)+'L'+X(TOTAL)+' '+base+'L'+X(0)+' '+base+'Z';
  const anim=!S.drawnOnce;S.drawnOnce=true;
  if(cur&&cur.range[1]===18)g+='<rect x="'+X(0)+'" y="'+PT+'" width="'+(X(18)-X(0))+'" height="'+(base-PT)+'" fill="#0830E8" opacity=".10"/>';
  if(cur&&cur.wave){$('legend').innerHTML='<span><i class="d"></i>Lo que estimamos</span><span><i></i>Cómo se mueve de verdad</span>';
    g+='<path d="'+area(wv)+'" fill="url(#lzAr)"/><path d="'+path(pts)+'" fill="none" stroke="#7d93d6" stroke-width="2.5" stroke-dasharray="7 6"/><path d="'+path(wv)+'" fill="none" stroke="#001868" stroke-width="3.5" stroke-linejoin="round"/>';
    let best=-1,bv=0;for(let m=Math.round(END*.5);m<END-20;m++){const r=wv[m]/pts[m];if(best<0||r<bv){bv=r;best=m}}
    if(best>0){const vx=X(best),vy=Y(wv[best]);g+='<circle cx="'+vx+'" cy="'+vy+'" r="7" fill="#0f8a5f" stroke="#fff" stroke-width="3"/><line x1="'+vx+'" x2="'+vx+'" y1="'+(vy-12)+'" y2="'+(vy-44)+'" stroke="#0f8a5f" stroke-width="1.5"/>'+callout(vx,vy-44,'Aquí baja: tu aportación compra más','la misma cantidad, más unidades','center','#0f8a5f')}
  }else{
    const dim=cur?' opacity=".22"':'';
    g+='<g'+dim+'><path class="'+(anim?'areain':'')+'" d="'+area(pts)+'" fill="url(#lzAr)"/><path id="ln" class="'+(anim?'drawing':'')+'" d="'+path(pts)+'" fill="none" stroke="#001868" stroke-width="3.5"/></g>';
    if(cur)g+='<g clip-path="url(#lzHl)"><path d="'+area(pts)+'" fill="url(#lzAr)"/><path d="'+path(pts)+'" fill="none" stroke="#0830E8" stroke-width="5"/></g>';
  }
  const dot=(m,c)=>'<circle cx="'+X(m)+'" cy="'+Y(pts[m])+'" r="7" fill="'+(c||'#0830E8')+'" stroke="#fff" stroke-width="3"/>';
  if(!cur||cur.end)g+=dot(TOTAL)+callout(X(TOTAL),Y(pts[TOTAL])-16,money(calcMensual(D.fondo65))+' al mes','desde los 65','left');
  if(cur&&cur.range[1]===6)g+=dot(0)+callout(X(0)+14,Y(0)-18,'Hoy: '+money(S.pmt)+' al mes',dateAt(0),'right');
  if(cur&&cur.range[1]===18)g+=dot(18)+callout(X(18)+14,Y(pts[18])-20,'Mes 18: tu base está lista',dateAt(18)+' · se abren tus opciones','right');
  if(cur&&cur.chips)g+=dot(18)+dot(END)+callout(X(END)-14,Y(pts[END])-18,'Terminas de aportar',dateAt(END)+' · llevas '+mill(D.fondoPlan),'left');
  if(cur&&cur.refund){for(let y=1;y<=S.years;y++){const m=y*12-6;g+='<circle cx="'+X(m)+'" cy="'+Y(pts[m])+'" r="5.5" fill="#0f8a5f" stroke="#fff" stroke-width="2"/>'}
    g+=callout(X(30)+8,Y(pts[30])-22,'+'+money(D.dev1)+' de vuelta','el primer año · cada punto es un año','right','#0f8a5f')}
  if(cur&&cur.at60){const M60=(60-age)*12;g+='<line x1="'+X(M60)+'" x2="'+X(M60)+'" y1="'+Y(pts[M60])+'" y2="'+base+'" stroke="#0830E8" stroke-dasharray="4 4"/>'+dot(M60)+callout(X(M60)-14,Y(pts[M60])-18,money(calcMensual(D.fondo60))+' al mes','desde los 60 · Art. 93','left')}
  sv.innerHTML=g;
  const ln=$('ln');if(ln&&anim){ln.style.setProperty('--len',ln.getTotalLength())}
}
addEventListener('resize',()=>drawChart());

// Move original controls with anchors: listeners, IDs and saved-session plumbing survive.
const moved=[];
function move(id,to,label){const e=original(id);if(!e||!to)return;const anchor=document.createComment('lienzo:'+id);e.before(anchor);moved.push({e,anchor,hidden:e.hidden,display:e.style.display});if(label){const wrap=document.createElement('label');wrap.className='original-field';wrap.textContent=label;wrap.append(e);to.append(wrap)}else to.append(e);e.hidden=false;e.style.display='';}
function restoreNodes(){for(const {e,anchor,hidden,display} of moved.splice(0)){anchor.replaceWith(e);e.hidden=hidden;e.style.display=display}}
function mountOriginals(){
 const target=$('decisionFields');
 if(target&&S.dec){
  if(S.dec==='pensar'){move('gaThinkPanel',target);}
  else{
   const title=document.createElement('h3');title.textContent='Datos para tu solicitud';target.append(title);
   for(const [id,label] of [['gaPhone','Teléfono'],['gaEmail','Correo'],['gaProfession','Profesión'],['gaCivil','Estado civil'],['gaDecision','Quién decide']])if(!original(id)?.value)move(id,target,label);
   if(S.dec==='agendar'){move('gaOpeningDate',target,'Día');move('gaOpeningTime',target,'Hora')}
  }
  const go=document.createElement('button');go.className='go';go.textContent=S.dec==='pensar'?'Guardar y continuar':'Continuar →';go.onclick=()=>{original('gaPostCalcContinue').click();if(original('gaPreopenView')?.style.display!=='none')suspend()};target.append(go);
 }
 if($('responseBody')&&S.dq!=null){
  const slides=[8,5,4,8,8,11,10];if(!window.GaSupport?.render(slides[S.dq])){window.GaOpenResponse?.(slides[S.dq]);$('responseBody').textContent='';return}
  if(S.dq===3||S.dq===4){window.GaSupport?.show('fiscal');original('gaSupportContent').dataset.fiscalFilter=S.dq===3?'151':'93'}
  else if(original('gaSupportContent'))delete original('gaSupportContent').dataset.fiscalFilter;
  move('gaSupportContent',$('responseBody'));
 }
}
function suspend(){restoreNodes();root.hidden=true;document.body.classList.remove('ga-lienzo')}
function activate(){if(window.GA_FLOW_CLASSIC)return;root.hidden=false;document.body.classList.add('ga-lienzo');recalc()}
function bootKnown(){
 const d=window.__gaKnown||{};if(!window.garbaIdentified||!d.edad||!d.ahorro)return;
 S.pdp=true;
 const vals={nombre:d.nom,edad:d.edad,metaHoy:d.des,pmt:d.ahorro};for(const [k,v] of Object.entries(vals))if(v!=null&&!read(k))S[k]=v;
 const join=v=>Array.isArray(v)?v.join(' · '):v||'';
 for(const [k,v] of Object.entries({dolor:d.dolor,meta:d.meta,porque:d.porque,condicion:d.condicion,freno:d.freno}))if(!read(k))S[k]=join(v);
 S.q='hola';recalc();
}
$('duda').onclick=()=>{S.duda=!S.duda;S.dq=null;render()};
$('side').addEventListener('click',e=>{if(e.target.id==='dqb'){S.dq=null;render()}});
const actions=[['Modo celular',()=>{root.classList.toggle('cellular');root.querySelector('.stage').classList.toggle('cellular')}],['Copiar resumen para WhatsApp',()=>navigator.clipboard?.writeText(window.GaThreeActs.summary())],['Más ajustes',()=>{suspend();window.GaPresentation?.focusInputs()}],['Ver detalle',()=>{suspend();window.GaLayout?.select('gap')}],['Abrir panel del asesor',()=>original('gaAdvisorPanelButton')?.click()],['Recursos',()=>{S.duda=true;render()}]];
for(const [label,fn] of actions){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{$('lMenu').open=false;fn()};$('lMenuItems').append(b)}
const returnButton=document.createElement('button');returnButton.id='gaReturnLienzo';returnButton.className='btn-light';returnButton.textContent='Volver a donde íbamos';returnButton.onclick=activate;document.querySelector('.calculator-heading')?.append(returnButton);
original('gaFlowToggle')?.addEventListener('click',()=>{if(window.GA_FLOW_CLASSIC)suspend();else activate()});
// Preserve v2r: the existing resume button restores the scenario before the results activate.
new MutationObserver(()=>{if(window.GA_FLOW_CLASSIC)return;if(original('resultsView').classList.contains('active')&&root.hidden){S.act=2;S.step=0;activate()}}).observe(original('resultsView'),{attributes:true,attributeFilter:['class']});
// La herramienta puede recalcular por su cuenta (p. ej. al abrir la calculadora ajusta el plazo): re-sincroniza con el resultado vigente.
{const f65=document.getElementById('fondo65');if(f65)new MutationObserver(()=>{if(busy||root.hidden||!(S.edad&&S.pmt))return;const k=reportState.fondo65+'|'+reportState.fondoPlan;if(k===D?._k)return;D={...reportState,dev1:reportState.devolucionFiscalPrimerAnoVista,impacto65:reportState.impactoISR65,sug:reportState.pmtSugerido,infl:reportState.infl,_k:k};S.drawnOnce=S.drawnOnce;render()}).observe(f65,{childList:true,characterData:true,subtree:true})}
document.addEventListener('ga:projection-updated',()=>{if(!busy&&!root.hidden){D=S.edad&&S.pmt?{...reportState,dev1:reportState.devolucionFiscalPrimerAnoVista,impacto65:reportState.impactoISR65,sug:reportState.pmtSugerido,infl:reportState.infl}:null;render()}});
window.addEventListener('resize',()=>{if(!root.hidden)drawChart()});
document.addEventListener('change',e=>{if(root.hidden||root.contains(e.target)||busy)return;if(Object.values(fields).includes(e.target.id))setTimeout(()=>{if(!busy&&!root.hidden)recalc()},0)});
function showSummary(){S.act=1;S.duda=false;S.step=0;S.q='hola';recalc()}
window.GaLienzo={get act(){return S.act},get step(){return S.step},get question(){return S.q},goAct,goStep,render,recalc,activate,suspend,bootKnown,showSummary};
original('gaCredentialsModal')&&document.body.append(original('gaCredentialsModal'));
if(window.GaV2){const old=window.GaV2.boot;window.GaV2.boot=function(){old();bootKnown();if(window.GaV2._state.resume)suspend()}}
bootKnown();if(!window.GA_FLOW_CLASSIC&&!window.GaV2?._state.resume)activate();
})();
