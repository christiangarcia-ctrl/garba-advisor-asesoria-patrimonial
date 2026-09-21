/* Advisor V2 — continuidad, interpretación y cierre alrededor de la calculadora (que NO se modifica).
   Solo actúa en sesiones identificadas con diagnóstico completo de Punto de Partida (window.garbaIdentified).
   Todo lo que se muestra aquí está escrito para que lo vea el prospecto (se comparte pantalla completa). */
(function(){
'use strict';
// ---- Configuración explícita y ajustable (sin lógica financiera) ----
const CFG=window.GA_V2_CONFIG=Object.assign({
 slides:{
  basic:[2,3,4],                       // contexto del retiro, dos puntos de partida, PPR explicado simple
  complementary:[5,6,8,9,10,11,13],    // confianza, fiscal/flexibilidad, puente, apertura, volatilidad, costos
  byKnowledge:{nada:{add:[2,4]},algo:{add:[4]},bastante:{drop:[2,3,4],add:[9]}},
  byChip:{
   'Mantener flexibilidad y acceso al dinero cuando sea necesario':[8],
   'Tener seguridad, respaldo y claridad sobre cómo funciona':[5,6],
   'Aprovechar de forma eficiente los beneficios fiscales disponibles':[8],
   'Buscar crecimiento sin perder de vista el nivel de riesgo':[11],
   'Me preocupaba comprometerme con algo poco flexible':[8],
   'Había priorizado otros gastos y proyectos':[9],
   'No había encontrado una propuesta que respondiera realmente a mis objetivos':[9],
   'Estuve a punto de contratar un plan, pero no lo concreté':[10],
   'No tengo AFORE o no he cotizado de manera constante.':[3],
   'Sé que mi AFORE probablemente no será suficiente.':[3]
  },
  max:6
 },
 brief:{closeGapPct:0.15,largeGapPct:0.5},   // brecha / aportación necesaria
 saveDelayMs:1200
},window.GA_V2_CONFIG||{});
const REG={NOM:'Recibes nómina',PF:'Trabajas por tu cuenta',INF:'Emprendedor / RESICO / informal'};
const S=()=>window.GaShell,$=id=>document.getElementById(id);
const st={rev:0,conocimiento:null,escenarios:[],trabajado:null,recursos:[],recomendacion:null,precapturaCompleta:false,resume:null,slot:null,scheduled:null};
let active=false,saveTimer=null,saving=false,dirty=false,workStart=null;
function work(){if(!workStart)workStart=new Date().toISOString()}

function h(tag,attrs,...kids){
 const e=document.createElement(tag);
 for(const [k,v] of Object.entries(attrs||{})){if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v)}
 for(const k of kids.flat())if(k!=null&&k!==false)e.append(k.nodeType?k:document.createTextNode(String(k)))
 return e
}
const money=n=>S().money(n);
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
const list=a=>Array.isArray(a)?a.map(x=>String(x).replace(/\.\s*$/,'')).join(' · '):String(a||'')
const fmtDate=iso=>new Date(iso).toLocaleString('es-MX',{timeZone:'America/Hermosillo',dateStyle:'long',timeStyle:'short'})
const sceneEl=k=>S().scenes.find(s=>s.dataset.scene===k)
const idxOf=k=>S().scenes.indexOf(sceneEl(k))
const known=()=>window.__gaKnown||{}
function eligible(d){return !!(d&&d.dolor?.length&&d.meta?.length&&d.porque?.length&&d.condicion?.length&&d.freno?.length&&d.edadR&&d.des&&d.ahorro&&d.edad)}
function style(){
 if($('gaV2Style'))return
 document.head.append(h('style',{id:'gaV2Style'},`
 .ga-v2-card{border:1px solid #dce7f2;border-radius:18px;background:#fbfdff;padding:18px 20px;margin:14px 0}
 .ga-v2-card h3{margin:0 0 10px;font-size:15px;color:#0b1f3a}
 .ga-v2-row{display:grid;grid-template-columns:210px 1fr;gap:12px;padding:7px 0;border-top:1px solid #eef3f8;font-size:14px;line-height:1.45}
 .ga-v2-row:first-of-type{border-top:0}.ga-v2-row span{color:#5b6b7f}.ga-v2-row b{font-weight:600;color:#10233c}
 .ga-v2-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
 .ga-v2-link{background:none;border:0;color:#0830e8;text-decoration:underline;cursor:pointer;font:inherit;padding:8px 4px}
 .ga-v2-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
 .ga-v2-chip{border:1.5px solid #cbd8e6;background:#fff;border-radius:14px;padding:12px 18px;cursor:pointer;font:inherit;font-weight:600;color:#10233c}
 .ga-v2-chip.on{border-color:#0830e8;background:#eef3ff;color:#0830e8}
 .ga-v2-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
 .ga-v2-stat{border:1px solid #dce7f2;border-radius:14px;padding:12px 14px;background:#fff}.ga-v2-stat span{display:block;font-size:11.5px;color:#5b6b7f}.ga-v2-stat b{font-size:19px;color:#0b1f3a}
 .ga-v2-hist{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}.ga-v2-hist th,.ga-v2-hist td{padding:6px 8px;border-bottom:1px solid #eef3f8;text-align:right}.ga-v2-hist th:first-child,.ga-v2-hist td:first-child{text-align:left}
 .ga-v2-opt{display:block;border:1.5px solid #cbd8e6;border-radius:14px;padding:12px 14px;margin:8px 0;cursor:pointer;background:#fff}.ga-v2-opt.on{border-color:#0830e8;background:#eef3ff}
 .ga-v2-day{margin:10px 0 4px;font-weight:700}.ga-v2-cta{display:inline-block;background:#0830e8;color:#fff!important;text-decoration:none;font-weight:700;border-radius:14px;padding:12px 20px}.ga-v2-slotbtn{border:1.5px solid #cbd8e6;background:#fff;border-radius:12px;padding:9px 14px;margin:4px 6px 4px 0;cursor:pointer;font:inherit}.ga-v2-slotbtn.on{border-color:#0830e8;background:#eef3ff;color:#0830e8;font-weight:700}
 .ga-v2-msg{margin:10px 0;font-size:13px;color:#5b6b7f}.ga-v2-err{color:#b42318}
 body.ga-v2 .ga-professional-recommendation{display:none}
 @media(max-width:700px){.ga-v2-row{grid-template-columns:1fr}.ga-v2-grid{grid-template-columns:1fr 1fr}}`))
}
// ---------------- Pantallas de entrada ----------------
function renderKnown(){
 const d=known(),root=$('gaV2Known');root.replaceChildren()
 const rows=(items)=>items.filter(([,v])=>v!==''&&v!=null).map(([k,v])=>h('div',{class:'ga-v2-row'},h('span',{text:k}),h('b',{text:v})))
 root.append(h('div',{class:'ga-kicker',text:'Punto de partida'}),h('h2',{text:'Lo que ya sabemos de ti'}),
  h('p',{text:'Esto es lo que nos compartiste. Confirma que sigue siendo así o corrígelo; no vamos a volver a preguntarlo.'}),
  h('div',{class:'ga-v2-card'},h('h3',{text:'Tú'}),...rows([['Nombre',d.nom],['Edad',d.edad?`${d.edad} años`:''],['Situación laboral',REG[d.reg]||''],['Ingreso mensual aproximado',d.ingreso?money(d.ingreso):'']])),
  h('div',{class:'ga-v2-card'},h('h3',{text:'Lo que buscas'}),...rows([['Lo que hoy te preocupa',list(d.dolor)],['Lo que quieres conseguir',list(d.meta)],['Por qué ahora',list(d.porque)],['Lo que no puede faltar',list(d.condicion)],['Lo que te había frenado',list(d.freno)],['En tus palabras',d.dolorPorque||'']])),
  h('div',{class:'ga-v2-card'},h('h3',{text:'Tus números'}),...rows([['Ingreso mensual deseado (valor de hoy)',money(d.des)],['Aportación mensual que consideras sostenible',money(d.ahorro)],['Edad de retiro objetivo',d.edadR?`${d.edadR} años`:''],['Plazo que elegiste',d.plazo?`${d.plazo} años`:'']])),
  h('div',{class:'ga-v2-actions'},
   h('button',{class:'ga-v2-cta',type:'button',style:'border:0;cursor:pointer',onclick:()=>{S().setConfirmed(true);S().diagnosisChecks.ready='No';$('gaNext').click()}},'Sí, así es →'),
   h('button',{class:'ga-v2-link',type:'button',onclick:()=>profundizar()},'Corregir o profundizar')))
}
function profundizar(){ // vuelve al recorrido original completo; nada se pierde
 S().setConfirmed(false);delete S().diagnosisChecks.ready
 for(const k of ['1b','2','3','4','5','6','7'])delete sceneEl(k).dataset.skip
 for(const k of ['v2r','v2a','v2b'])sceneEl(k).dataset.skip='1'
 S().show(idxOf('1b'))
}
function bind(el,id,evt){el.addEventListener(evt,()=>{const t=$(id);if(t){t.value=el.value;t.dispatchEvent(new Event('input',{bubbles:true}));t.dispatchEvent(new Event('change',{bubbles:true}))}})}
function renderMissing(){
 const root=$('gaV2Missing'),d=known();root.replaceChildren()
 const prof=h('input',{id:'gaV2Prof',placeholder:'Ej. Ingeniera, comerciante…',value:$('gaProfession').value||''});bind(prof,'gaProfession','input')
 const civil=$('gaCivil').cloneNode(true);civil.id='gaV2Civil';civil.value=$('gaCivil').value;bind(civil,'gaCivil','change')
 const dec=$('gaDecision').cloneNode(true);dec.id='gaV2Decision';dec.value=$('gaDecision').value;bind(dec,'gaDecision','change')
 const isr=h('div',{id:'gaV2IsrBox',style:'display:none;margin-top:10px'},h('label',{text:'Ingreso mensual aproximado (para estimar la devolución de ISR)'}),h('input',{id:'gaV2Ingreso',type:'number',min:'0',step:'500',placeholder:'Ej. 100000',value:$('gaIngresoMensual').value||d.ingreso||''}))
 bind(isr.querySelector('input'),'gaIngresoMensual','input')
 const fiscal=h('div',{class:'ga-v2-chips'},...[['151','Artículo 151'],['93','Artículo 93']].map(([v,t])=>h('button',{class:'ga-v2-chip',type:'button','data-fiscal':v,onclick:e=>{
  root.querySelectorAll('[data-fiscal]').forEach(b=>b.classList.toggle('on',b===e.currentTarget));const tax=$('gaTax');tax.value=v;tax.dispatchEvent(new Event('change',{bubbles:true}));isr.style.display=v==='151'?'block':'none';touch()}},t)))
 const know=h('div',{class:'ga-v2-chips'},...[['nada','Nada'],['algo','Algo'],['bastante','Bastante']].map(([v,t])=>h('button',{class:'ga-v2-chip'+(st.conocimiento===v?' on':''),type:'button','data-know':v,onclick:e=>{
  st.conocimiento=v;root.querySelectorAll('[data-know]').forEach(b=>b.classList.toggle('on',b===e.currentTarget));touch()}},t)))
 root.append(h('div',{class:'ga-kicker',text:'Para personalizar tu proyección'}),h('h2',{text:'Solo nos falta esto'}),
  h('p',{text:'Lo demás ya lo tenemos. Estos datos afinan la proyección y la explicación.'}),
  h('div',{class:'ga-grid'},h('div',{class:'ga-field'},h('label',{text:'Profesión o actividad'}),prof),h('div',{class:'ga-field'},h('label',{text:'Estado civil'}),civil),h('div',{class:'ga-field full'},h('label',{text:'¿Quién participa en la decisión?'}),dec)),
  h('div',{class:'ga-v2-card'},h('h3',{text:'Escenario fiscal a proyectar'}),fiscal,isr),
  h('div',{class:'ga-v2-card'},h('h3',{text:'¿Qué tanto sabes hoy de los planes de retiro?'}),know))
 if($('gaTax').value){root.querySelector(`[data-fiscal="${$('gaTax').value}"]`)?.classList.add('on');if($('gaTax').value==='151')isr.style.display='block'}
}
// ---------------- Reanudar ----------------
function renderResume(adv){
 const root=$('gaV2Resume'),sc=adv.escenarios?.[adv.trabajado??adv.escenarios.length-1]||adv.escenarios?.[adv.escenarios.length-1]
 const last=(adv.reuniones||[]).slice(-1)[0]
 root.replaceChildren(h('div',{class:'ga-kicker',text:'Continuemos'}),h('h2',{text:'Retomemos donde lo dejamos'}),
  h('p',{text:last?`Nuestra última sesión fue el ${fmtDate(last.inicio).replace(/\.$/,'')}. Ya tenemos tu punto de partida y lo que trabajamos, así que no partimos de cero.`:'Ya tenemos tu punto de partida y lo que trabajamos; no partimos de cero.'}),
  h('div',{class:'ga-v2-card'},h('h3',{text:'Lo que quedó trabajado'}),
   ...(sc?[['Aportación mensual del escenario',money(sc.in?.pmt)],['Aportación necesaria (inicial)',money(sc.out?.pmtSugerido)],['Ingreso mensual deseado',money(sc.in?.metaHoy)]].map(([k,v])=>h('div',{class:'ga-v2-row'},h('span',{text:k}),h('b',{text:v}))):[]),
   adv.recomendacion?.texto?h('div',{class:'ga-v2-row'},h('span',{text:'Recomendación'}),h('b',{text:adv.recomendacion.texto})):null,
   adv.siguiente?.at?h('div',{class:'ga-v2-row'},h('span',{text:'Siguiente reunión'}),h('b',{text:fmtDate(adv.siguiente.at)})):null),
  h('div',{class:'ga-v2-actions'},
   sc?h('button',{class:'ga-v2-cta',type:'button',style:'border:0;cursor:pointer',onclick:()=>resumeCalc(adv)},'Continuar con este escenario →'):null,
   h('button',{class:sc?'ga-v2-link':'ga-btn',type:'button',onclick:()=>{sceneEl('v2r').dataset.skip='1';S().show(idxOf('v2a'))}},sc?'Revisar desde el inicio':'Continuar →')))
}
function restoreInputs(adv){
 const set=(id,v)=>{const e=$(id);if(e&&v!=null&&v!==''){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}}
 const p=adv.perfil||{},e=adv.entradas||{}
 set('gaProfession',p.profesion);set('gaCivil',p.estadoCivil);set('gaDecision',p.decide)
 set('gaRetireAge',e.edadRetiro);set('gaGoal',e.meta);set('gaPmt',e.pmt);set('gaTax',e.fiscal||p.fiscal);set('gaIngresoMensual',e.ingresoMensual);set('gaIsrPct',e.isrPct)
 if(e.reinvertirISR!=null&&$('gaReinvertISR'))$('gaReinvertISR').checked=!!e.reinvertirISR
 S().setConfirmed(true);S().diagnosisChecks.ready='No'
}
function resumeCalc(adv){
 restoreInputs(adv)
 try{S().proceedOpenProposal()}catch(e){console.warn('[GarBa Advisor V2] No se pudo reabrir la proyección:',e);S().show(idxOf('v2a'))}
}
// ---------------- Explicación adaptativa ----------------
function slides(ids){
 const k=CFG.slides,d=known(),mapped=[]
 for(const v of [...(d.dolor||[]),...(d.condicion||[]),...(d.freno||[])])(k.byChip[v]||[]).forEach(n=>mapped.push(n))
 const kn=k.byKnowledge[st.conocimiento]||{add:[],drop:[]}
 let out=[1,...(kn.add||[]),...mapped,...ids.filter(x=>x!==1)]
 out=[...new Set(out)].filter(n=>!(kn.drop||[]).includes(n))
 return out.slice(0,k.max)
}
function viewed(id){if(id&&!st.recursos.includes(id)&&st.recursos.length<20){st.recursos.push(id);touch()}}
// ---------------- Historial automático de escenarios ----------------
const regName=r=>r==='93'?'Art. 93':r==='151'?'Art. 151':'Sin beneficio fiscal inmediato'
function readScenario(){
 const R=typeof reportState!=='undefined'?reportState:null;if(!R||!(R.fondoPlan>0)||!(R.pmtSugerido>0))return null
 const pmt=parseFloat($('pmt')?.value);if(!(pmt>0))return null
 const pick=(o,keys)=>{const r={};for(const k of keys)if(typeof o[k]==='number'&&Number.isFinite(o[k]))r[k]=o[k];return r}
 return {t:new Date().toISOString(),in:{...pick(R,['edad','metaHoy','planYears','selectedYears','infl','rAcc']),pmt,regimen:['93','151'].includes(R.regimenFiscal)?R.regimenFiscal:'ninguno'},out:pick(R,['pmtSugerido','fondoPlan','fondo65','fondo60','ingresoMensual','benefFiscal','totalAportado'])}
}
const key=s=>JSON.stringify([s.in,s.out])
function snapshotIfNew(){
 const s=readScenario();if(!s)return false
 const last=st.escenarios[st.escenarios.length-1]
 if(last&&key(last)===key(s))return false
 work();st.escenarios.push(s);if(st.escenarios.length>3)st.escenarios.shift();st.recomendacion=null;briefKey=''
 st.trabajado=st.escenarios.length-1;touch();return true
}
// ---------------- Decision Brief (determinístico) ----------------
function briefCase(sc){
 const need=sc.out.pmtSugerido,pmt=sc.in.pmt,gap=need-pmt,r=need>0?gap/need:0,B=CFG.brief
 const m=money,meta=m(sc.in.metaHoy)
 if(gap<=0)return {caso:'alcanza',opts:[
  {tipo:'iniciar',texto:`Con ${m(pmt)} al mes ya cubres la aportación necesaria para tu meta. Mi recomendación es formalizar este plan y revisarlo cada año.`},
  {tipo:'revisar',texto:'Hoy cubres lo necesario. Podemos dejarlo listo y revisar la aportación cada año conforme cambien tus ingresos.'}]}
 const iniciarGrad={tipo:'iniciar',texto:`Empezar con ${m(pmt)} al mes construye el hábito hoy; la meta completa requiere ${m(need)} al mes y lo revisamos en 12 meses.`}
 const extender={tipo:'extender',texto:'Otra ruta es ampliar el plazo para acercar la aportación necesaria a lo que puedes sostener; lo probamos ahora en la calculadora.'}
 if(r<=B.closeGapPct)return {caso:'cerca',opts:[
  {tipo:'ajustar',texto:`Estás a ${m(gap)} al mes de la aportación necesaria. Mi recomendación es subir tu aportación a ${m(need)} al mes para llegar a la meta completa.`},
  {tipo:'iniciar',texto:`Empezar con ${m(pmt)} al mes y aumentar gradualmente hasta ${m(need)} es una ruta viable y sostenible.`}]}
 if(r<=B.largeGapPct)return {caso:'moderada',opts:[iniciarGrad,extender,{tipo:'ajustar',texto:`También podemos ajustar la meta mensual a una cifra alcanzable con ${m(pmt)} al mes.`}]}
 return {caso:'amplia',opts:[
  {tipo:'ajustar',texto:`Con ${m(pmt)} al mes, la meta de ${meta} mensuales queda lejos. Mi recomendación es redefinir la meta a una cifra alcanzable y construir desde ahí.`},
  {tipo:'iniciar',texto:`Comenzar con ${m(pmt)} al mes y revisar en 6 meses evita que el plan se quede en papel mientras ajustamos la meta.`},extender]}
}
let briefKey=''
function renderBrief(){
 const box=$('gaV2Brief');if(!box)return
 const sc=st.escenarios[st.trabajado??st.escenarios.length-1];if(!sc)return
 const bc=briefCase(sc),same=bc.opts.find(o=>o.tipo===st.recomendacion?.tipo),chosen=same?(st.recomendacion.custom?st.recomendacion:{tipo:same.tipo,texto:same.texto}):{tipo:bc.opts[0].tipo,texto:bc.opts[0].texto}
 const k=JSON.stringify([sc,st.escenarios.length,st.trabajado,chosen,bc.caso]);if(k===briefKey)return;briefKey=k
 if(!st.recomendacion||st.recomendacion.texto!==chosen.texto||st.recomendacion.tipo!==chosen.tipo){st.recomendacion={tipo:chosen.tipo,texto:chosen.texto,...(chosen.custom?{custom:true}:{})};touch()}
 const need=sc.out.pmtSugerido,pmt=sc.in.pmt,gap=Math.max(0,need-pmt)
 const stat=(a,b)=>h('div',{class:'ga-v2-stat'},h('span',{text:a}),h('b',{text:b}))
 const hist=st.escenarios.length>1?h('table',{class:'ga-v2-hist'},h('thead',{},h('tr',{},h('th',{text:'Escenario'}),h('th',{text:'Aportación'}),h('th',{text:'Necesaria'}),h('th',{text:'Ingreso mensual est.'}))),
  h('tbody',{},...st.escenarios.map((e,i)=>h('tr',{},h('td',{},h('label',{},h('input',{type:'radio',name:'gaV2Work',checked:i===(st.trabajado??st.escenarios.length-1),onchange:()=>{st.trabajado=i;st.recomendacion=null;briefKey='';touch();renderBrief()}}),i===st.escenarios.length-1?' Actual':i===st.escenarios.length-2?' Anterior':' Previo')),h('td',{text:money(e.in.pmt)}),h('td',{text:money(e.out.pmtSugerido)}),h('td',{text:money(e.out.ingresoMensual)}))))):null
 const edit=h('textarea',{maxlength:'500',rows:'3',style:'width:100%;display:none;margin-top:8px',oninput:e=>{st.recomendacion={tipo:chosen.tipo,texto:e.target.value.slice(0,500),custom:true};touch()}});edit.value=chosen.texto
 box.replaceChildren(...[h('div',{class:'ga-kicker',text:'Lo que construimos hoy'}),
  h('div',{class:'ga-v2-grid'},stat('Ingreso mensual deseado (hoy)',money(sc.in.metaHoy)),stat('Aportación necesaria (inicial)',money(need)),stat('Aportación sostenible',money(pmt)),
   stat('Brecha',gap>0?money(gap)+' al mes':'Sin brecha'),stat('Plazo',sc.in.planYears?`${sc.in.planYears} años`:'—'),stat('Régimen fiscal',regName(sc.in.regimen))),
  hist,h('div',{class:'ga-kicker',text:'Mi recomendación'}),
  ...bc.opts.map(o=>h('label',{class:'ga-v2-opt'+(o.tipo===chosen.tipo?' on':'')},h('input',{type:'radio',name:'gaV2Rec',checked:o.tipo===chosen.tipo,style:'margin-right:8px',onchange:()=>{st.recomendacion={tipo:o.tipo,texto:o.texto};briefKey='';touch();renderBrief()}}),o.texto)),
  h('button',{class:'ga-v2-link',type:'button',onclick:e=>{edit.style.display=edit.style.display==='none'?'block':'none';e.currentTarget.blur()}},'Ajustar redacción'),edit,
  h('p',{class:'ga-v2-msg',text:'La decisión final siempre es tuya. Cifras ilustrativas; no constituyen garantía de rendimiento.'})].filter(Boolean))
}
function mountBrief(){
 if($('gaV2Brief')||!document.querySelector('.ga-professional-recommendation'))return false
 document.querySelector('.ga-professional-recommendation').before(h('div',{id:'gaV2Brief',class:'ga-v2-card'}));return true
}
function watchResults(){
 const rv=$('resultsView');if(!rv)return
 let t=null
 new MutationObserver(recs=>{
  if(recs.every(r=>$('gaV2Brief')?.contains(r.target)))return
  clearTimeout(t);t=setTimeout(()=>{if(!rv.classList.contains('active'))return;mountBrief();snapshotIfNew();renderBrief()},700)
 }).observe(rv,{attributes:true,childList:true,subtree:true,characterData:true})
}
// ---------------- Cierre: segunda asesoría ----------------
function decision(){return S().postCalcChecks.decision}
function panel(){return $('gaSchedulePanel')}
function slotsBox(){let b=$('gaV2Slots');if(!b){b=h('div',{id:'gaV2Slots',style:'grid-column:1/-1'});panel().append(b);[...panel().children].forEach(c=>{if(c!==b)c.style.display='none'})}return b}
async function loadSlots(){
 const box=slotsBox();box.replaceChildren(h('p',{class:'ga-v2-msg',text:'Buscando horarios disponibles…'}))
 try{
  const r=await window.GarbaAccess.call('advisory_slots');renderSlots(r.days||[])
 }catch(e){box.replaceChildren(h('p',{class:'ga-v2-msg ga-v2-err',text:'No pudimos cargar los horarios. Intenta de nuevo.'}),h('button',{class:'ga-v2-link',type:'button',onclick:loadSlots},'Reintentar'))}
}
function renderSlots(days){
 const box=slotsBox();st.slot=null
 if(!days.length){box.replaceChildren(h('p',{class:'ga-v2-msg',text:'No hay horarios disponibles en los próximos días hábiles. Acordemos uno directamente.'}));return}
 box.replaceChildren(h('h3',{text:'¿Te parece que agendemos nuestra siguiente reunión? Tengo estas fechas disponibles:',style:'margin:0 0 6px'}),
  ...days.map(d=>h('div',{},h('div',{class:'ga-v2-day',text:cap(d.label)}),...d.slots.map(s=>h('button',{class:'ga-v2-slotbtn',type:'button','data-at':s.at,onclick:e=>{st.slot=s.at;box.querySelectorAll('.ga-v2-slotbtn').forEach(b=>b.classList.toggle('on',b===e.currentTarget))}},s.label)))),
  h('p',{id:'gaV2SlotMsg',class:'ga-v2-msg'}))
}
async function confirmSchedule(){
 const msg=$('gaV2SlotMsg')||h('p',{}),btn=$('gaPostCalcContinue')
 if(!st.slot){msg.textContent='Elige un horario para continuar.';msg.className='ga-v2-msg ga-v2-err';return}
 work();btn.disabled=true;msg.textContent='Agendando…';msg.className='ga-v2-msg'
 try{
  await flush()
  const r=await window.GarbaAccess.call('advisory_schedule',{slot:st.slot})
  st.scheduled={at:r.at,label:r.label};if(r.revision!=null)st.rev=r.revision
  showScheduled()
 }catch(e){
  msg.textContent=e.status===409&&e.body?.days?'Ese horario ya no está disponible. Elige otro.':e.message||'No pudimos agendar. Intenta de nuevo.';msg.className='ga-v2-msg ga-v2-err'
  if(e.status===409&&e.body?.days)renderSlots(e.body.days)
  btn.disabled=false
 }
}
function showScheduled(){
 const box=slotsBox(),first=($('gaName').value||'').trim().split(/\s+/)[0]||'',tel=($('gaPhone').value||'').replace(/\D/g,'').slice(-10)
 const text=`Hola${first?' '+first:''}, confirmo nuestra segunda asesoría: ${st.scheduled.label}. Te comparto el enlace de la videollamada antes de la reunión.`
 box.replaceChildren(h('h3',{text:'Quedamos para nuestra siguiente reunión',style:'margin:0 0 6px'}),h('p',{style:'font-size:18px;font-weight:700;margin:4px 0',text:cap(st.scheduled.label)}),
  h('p',{class:'ga-v2-msg',text:'Dejamos guardado lo que trabajamos hoy para continuar desde aquí, sin volver a empezar.'}),
  h('div',{class:'ga-v2-actions'},tel.length===10?h('a',{class:'ga-v2-cta',target:'_blank',rel:'noopener',href:`https://wa.me/521${tel}?text=${encodeURIComponent(text)}`,text:'Enviar confirmación por WhatsApp'}):null,
   h('button',{class:'ga-v2-link',type:'button',onclick:()=>{loadSlots();$('gaPostCalcContinue').style.display=''}},'Cambiar horario')))
 $('gaPostCalcContinue').style.display='none'
 const rb=$('gaPostCalcRecommendation');if(rb){rb.querySelector('h3').textContent='Quedó agendada nuestra siguiente reunión.';rb.querySelector('p').textContent='Dejamos guardado lo que trabajamos hoy para continuar desde aquí.'}
}
function showSchedule(){
 const opt=document.querySelector('[data-postcalc="decision"][data-value="schedule"]');opt?.click();panel()?.scrollIntoView({behavior:'smooth',block:'center'})
}
function wireClose(){
 const opt=document.querySelector('[data-postcalc="decision"][data-value="schedule"]')
 if(opt){const t=opt.querySelector('strong'),sp=opt.querySelector('span');if(t)t.textContent='Agendar segunda asesoría';if(sp)sp.textContent='Elegimos fecha y dejamos guardado lo que trabajamos hoy.'}
 document.querySelectorAll('[data-postcalc="decision"]').forEach(b=>b.addEventListener('click',()=>{
  setTimeout(()=>{const c=$('gaPostCalcContinue');if(b.dataset.value==='schedule'){c.textContent='Confirmar segunda asesoría';c.style.display=st.scheduled?'none':'';const rb=$('gaPostCalcRecommendation');if(rb){rb.querySelector('h3').textContent=st.scheduled?'Quedó agendada nuestra siguiente reunión.':'Elige el horario que mejor te acomode.';rb.querySelector('p').textContent='Dejamos guardado lo que trabajamos hoy para continuar desde aquí.'};loadSlotsOnce()}else if(c)c.style.display='';work();touch()},0)}))
 $('gaPostCalcContinue').addEventListener('click',ev=>{if(decision()==='schedule'){ev.stopImmediatePropagation();ev.preventDefault();confirmSchedule()}},true)
 $('gaPreContinue')?.addEventListener('click',()=>{st.precapturaCompleta=true;touch()},true)
}
let slotsLoaded=false
function loadSlotsOnce(){if(st.scheduled){showScheduled();return}if(!slotsLoaded||!$('gaV2Slots')?.querySelector('.ga-v2-slotbtn')){slotsLoaded=true;loadSlots()}}
// ---------------- Persistencia (server-side, acotada) ----------------
const STAGE=k=>['0','1','v2a','v2b','v2r','1b','2','3','4','5','6','7'].includes(k)?k:null
function stageNow(){
 if(['gaPreopenView','gaStrategyView','gaReferralView','gaDecisionView'].some(id=>$(id)&&getComputedStyle($(id)).display==='block'))return 'preopen'
 if($('resultsView')?.classList.contains('active')&&getComputedStyle($('legacyApp')).display!=='none')return st.scheduled?'done':decision()==='schedule'?'schedule':'results'
 return STAGE(S().scenes[S().getIdx()]?.dataset.scene)||'0'
}
function buildState(){
 const v=id=>($(id)?.value||'').trim(),n=id=>{const x=parseFloat($(id)?.value);return Number.isFinite(x)&&x>=0?x:undefined}
 const dec=decision(),ruta=dec==='today'?'hoy':dec==='schedule'?'despues':dec==='adjust'?'ajustar':undefined
 const perfil={profesion:v('gaProfession').slice(0,80),estadoCivil:v('gaCivil'),decide:v('gaDecision')||'Yo',fiscal:v('gaTax')}
 const wk=st.escenarios[st.trabajado??st.escenarios.length-1]
 const entradas={edadRetiro:n('gaRetireAge'),meta:n('gaGoal'),pmt:wk?.in?.pmt??n('gaPmt'),fiscal:v('gaTax'),ingresoMensual:n('gaIngresoMensual'),isrPct:n('gaIsrPct'),reinvertirISR:$('gaReinvertISR')?.checked}
 for(const o of [perfil,entradas])for(const k of Object.keys(o))if(o[k]===undefined||o[k]===''&&k!=='estadoCivil'&&k!=='fiscal')delete o[k]
 const out={v:1,...(workStart?{sesion:workStart}:{}),stage:stageNow(),perfil,entradas,escenarios:st.escenarios,recursos:st.recursos,precapturaCompleta:st.precapturaCompleta}
 if(st.conocimiento)out.conocimiento=st.conocimiento
 if(st.trabajado!=null)out.trabajado=st.trabajado
 if(st.recomendacion)out.recomendacion={tipo:st.recomendacion.tipo,texto:st.recomendacion.texto||''}
 if(ruta)out.ruta=ruta
 return out
}
function touch(){if(!active)return;try{if(S().getIdx()>=idxOf('v2b')&&idxOf('v2b')>=0&&!S().scenes[S().getIdx()].dataset.skip&&S().scenes[S().getIdx()].dataset.scene==='v2b')work()}catch(e){}dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(flush,CFG.saveDelayMs)}
async function flush(){
 if(!active||saving||!dirty)return
 saving=true;dirty=false
 try{
  for(let attempt=0;attempt<2;attempt++){
   try{const r=await window.GarbaAccess.call('advisory_save',{revision:st.rev,data:buildState()});st.rev=r.revision;break}
   catch(e){if(e.status===409&&typeof e.body?.revision==='number'){st.rev=e.body.revision;continue}throw e}
  }
 }catch(e){dirty=true;console.warn('[GarBa Advisor V2] Guardado pendiente:',e.message);clearTimeout(saveTimer);saveTimer=setTimeout(flush,8000)}
 saving=false
}
addEventListener('pagehide',()=>{if(dirty)flush()})
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()})
// ---------------- Arranque ----------------
function boot(){
 if(!window.garbaIdentified||!window.GaShell)return
 const d=known();if(!eligible(d))return
 const b=window.__gaAdvisoryBoot||{},adv=b.advisory
 active=true;window.GaV2.active=true;st.rev=b.revision||0
 style();document.body.classList.add('ga-v2');S().setConfirmed(true);S().diagnosisChecks.ready='No'
 if(adv){st.conocimiento=adv.conocimiento||null;st.escenarios=adv.escenarios||[];st.trabajado=adv.trabajado??null;st.recursos=adv.recursos||[];st.recomendacion=adv.recomendacion||null;st.precapturaCompleta=!!adv.precapturaCompleta;st.resume=adv;if(adv.siguiente)st.scheduled={at:adv.siguiente.at,label:fmtDate(adv.siguiente.at)}}
 // recorrido corto: 1b–7 se resumen en dos pantallas; "Corregir o profundizar" vuelve al recorrido completo
 for(const k of ['1b','2','3','4','5','6','7'])sceneEl(k).dataset.skip='1'
 delete sceneEl('v2a').dataset.skip;delete sceneEl('v2b').dataset.skip
 renderKnown();renderMissing();wireClose();watchResults()
 const worked=adv&&(adv.escenarios?.length||adv.siguiente||adv.recomendacion)
 if(worked){delete sceneEl('v2r').dataset.skip;renderResume(adv);S().show(idxOf('v2r'))}
 touch()
}
window.GaV2={active:false,boot,touch,slides,viewed,showSchedule,_state:st,_config:CFG};
})();
