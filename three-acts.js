/* Three-act decision layer; never modifies projection formulas. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const state={reason:'',date:'',time:'',noDate:false,mobile:false,nextStep:''};
const classic=()=>window.GA_FLOW_CLASSIC===true;
const existing=(id)=>$(id);
const make=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x};
const workspace=()=>existing('resultsView');
const readMoney=id=>Number((existing(id)?.textContent||'').replace(/[^\d.-]/g,''))||0;
const projection=()=>readMoney('fondo65');
const pmt=()=>Number(existing('pmt')?.value||existing('gaPmt')?.value||0);
const view=()=>!classic()&&workspace()?.classList.contains('active');
const assign=(id,v)=>{if(existing(id))existing(id).textContent=v};
const persist=()=>{try{sessionStorage.setItem('garbaThreeAct',JSON.stringify(state))}catch(e){}};
try{Object.assign(state,JSON.parse(sessionStorage.getItem('garbaThreeAct')||'{}'))}catch(e){}
const hero=make('section','card ga-act-hero');
hero.id='gaActHero';
hero.innerHTML='<div class="ga-kicker">ACTO 2 · TU NÚMERO</div><h2>Un punto de partida que puedes sostener</h2><p>Con <strong id="gaActPmt">—</strong> al mes → <strong id="gaActFuture">—</strong> a los 65</p><p id="gaActFiscal"></p><div class="ga-act-actions"><button class="ga-btn" id="gaActDecision">Ir a la decisión →</button><button class="ga-btn" id="gaActCopy">Copiar resumen para WhatsApp</button></div>';
const options=make('section','card');options.id='gaActOptions';options.innerHTML='<div class="ga-kicker">Opciones de arranque</div><h3>Empezar con una cantidad realista</h3><div id="gaActOptionCards"></div><p class="ga-mini">Cada opción se calculará con el motor original al seleccionarla.</p>';
const detail=make('details','card');detail.id='gaActGoal';detail.innerHTML='<summary>Ver meta completa</summary>';const gap=existing('gaProjectionGap');if(gap)detail.append(gap);
const future=make('details','card');future.id='gaActTechnical';future.innerHTML='<summary>Ver gráfica y tablas de detalle</summary>';
const graph=existing('gaProjectionGraph');
if(graph)future.append(graph);
const original=workspace()?.querySelector('.plan-hero');
if(original){original.before(hero);hero.after(options,detail,future)}
const extraCss=make('style');
extraCss.textContent='.ga-act-hero{margin:18px 0}.ga-act-hero p{font-size:clamp(22px,3.4vw,48px);line-height:1.25;font-weight:700}.ga-act-hero strong{color:var(--presentation-navy,#001868)}.ga-act-actions{display:flex;flex-wrap:wrap;gap:12px}.ga-act-option{padding:16px;border:1px solid var(--presentation-line,#dce3ee);border-radius:14px;margin:8px 0}.ga-act-option strong{display:block;font-size:24px}.ga-think-panel{padding:18px;margin-top:16px}.ga-think-panel .ga-field{margin:12px 0}.ga-three-mobile .ga-act-hero p{font-size:clamp(60px,5vw,76px)}.ga-three-mobile .projection-graph,.ga-three-mobile #resultsView table,.ga-three-mobile #resultsView .table-wrap,.ga-three-mobile .ga-act-technical{display:none}.ga-three-mobile #gaActTechnical{display:none}.ga-three-mobile #gaActOptions .ga-act-option strong{font-size:42px}.ga-three-mobile #gaActHero{padding:24px}.ga-think-panel[hidden]{display:none!important}';
document.head.append(extraCss);
let comparing=false;
function sameEngineProjection(amount,delay=0){
 const input=existing('pmt'),age=existing('edad'),engine=window.calcAccum;
 if(!input||!age||typeof engine!=='function'||!(amount>0))return null;
 const saved=input.value,originalAge=age.value;
 if(Number(saved)===amount&&!delay)return existing('fondo65')?.textContent||null;
 if(delay&&Number(originalAge)+delay>=65)return null;
 comparing=true;
 let value=null;
 try{input.value=String(amount);if(delay)age.value=String(Number(originalAge)+delay);if(engine()!==false)value=existing('fondo65')?.textContent||null}
 finally{input.value=saved;age.value=originalAge;try{engine()}catch(e){console.error('No se pudo restaurar la proyección',e)}comparing=false}
 return value;
}
function refresh(){
 const amount=pmt();assign('gaActPmt',money(amount));assign('gaActFuture',existing('fondo65')?.textContent||'—');
 const tax=existing('regimenFiscal')?.value;const fiscal=existing('gaActFiscal');
 if(fiscal)fiscal.textContent=tax==='151'&&existing('taxFirstAmount')?.textContent&&existing('taxFirstAmount').textContent!=='—'?'Beneficio fiscal estimado del primer año: '+existing('taxFirstAmount').textContent:tax==='93'?(existing('rptFiscalText')?.textContent||'Consulta el tratamiento del Art. 93 en los resultados de esta proyección.') :'';
 const candidates=[amount];const suggested=Number((existing('gaSuggestedMini')?.textContent||'').replace(/[^\d.-]/g,''))||0;
 if(suggested>amount){const intermediate=Math.round(((amount+suggested)/2)/500)*500;if(intermediate>amount&&intermediate<suggested)candidates.push(intermediate);candidates.push(suggested)}
 const wrap=existing('gaActOptionCards');if(wrap){wrap.replaceChildren();for(const n of [...new Set(candidates)].filter(n=>n>0)){const row=make('div','ga-act-option');const label=make('strong','',money(n)+'/mes');const btn=make('button','ga-btn','Elegir este');btn.type='button';btn.onclick=()=>{if(!existing('pmt'))return;existing('pmt').value=n;existing('pmt').dispatchEvent(new Event('input',{bubbles:true}));existing('pmt').dispatchEvent(new Event('change',{bubbles:true}));if(existing('gaPmt'))existing('gaPmt').value=n;window.calcAccum?.();refresh();persist()};const value=make('div','ga-mini',sameEngineProjection(n)||'Proyección no disponible');row.append(label,value,btn);wrap.append(row)}}
}
const wait=make('details','card');wait.id='gaActWait';wait.innerHTML='<summary>¿Y si empiezo el próximo año?</summary><h3>Costo de esperar un año</h3><p id="gaWaitResult">Abre esta sección para consultar el resultado.</p>';
future.after(wait);
wait.addEventListener('toggle',()=>{if(!wait.open)return;const now=sameEngineProjection(pmt()),later=sameEngineProjection(pmt(),1);const clean=v=>Number((v||'').replace(/[^\\d.-]/g,''))||0;assign('gaWaitResult',now&&later?'Si empiezas hoy: '+now+' a los 65 · Si empiezas en un año: '+later+' · Diferencia: '+money(clean(now)-clean(later)):'No es posible simular este escenario sin modificar el modelo existente.')});
const decisions=existing('gaPostCalcValidation');
const thinkButton=make('button','','');thinkButton.type='button';thinkButton.dataset.postcalc='decision';thinkButton.dataset.value='think';thinkButton.innerHTML='<strong>Necesito pensarlo</strong><span>Identifiquemos qué te falta para tomar una decisión.</span>';
const buttons=decisions?.querySelector('.ga-close-options');if(buttons)buttons.append(thinkButton);
const think=make('div','ga-think-panel card');think.id='gaThinkPanel';think.hidden=true;
const reasons=['El monto','Platicarlo con mi pareja','Compararlo con otra opción','No sé si tendré liquidez','Quiero empezar más adelante','Quiero estar seguro de con quién lo hago','Otra'];
think.innerHTML='<h3>¿Qué te gustaría pensar?</h3><div class="ga-field"><select id="gaThinkReason"><option value="">Selecciona una razón</option>'+reasons.map(r=>'<option>'+r+'</option>').join('')+'</select></div><div id="gaThinkNext"></div><div class="ga-field"><label>Fecha en que lo decidimos</label><input type="date" id="gaThinkDate"></div><div class="ga-field"><label>Hora</label><input type="time" id="gaThinkTime"></div><label><input type="checkbox" id="gaThinkNoDate"> Acordamos continuar sin fecha definida</label><div><button type="button" class="ga-btn" id="gaThinkConfirm">Guardar siguiente paso</button></div><p id="gaThinkError" role="status"></p>';
if(decisions)decisions.querySelector('.ga-close-question')?.after(think);
const reason=existing('gaThinkReason');const date=existing('gaThinkDate');const time=existing('gaThinkTime'),noDate=existing('gaThinkNoDate');
if(reason){reason.value=state.reason;reason.onchange=()=>{state.reason=reason.value;const guidance={'El monto':'Regresemos a las opciones de aportación.','Platicarlo con mi pareja':'Agendemos una segunda cita con ambos.','Compararlo con otra opción':'Revisemos juntos esa otra propuesta en una segunda cita.','No sé si tendré liquidez':'Revisemos las condiciones y recursos de flexibilidad.','Quiero empezar más adelante':'Revisemos qué cambia al esperar.','Quiero estar seguro de con quién lo hago':'Revisemos las credenciales y el respaldo antes de avanzar.','Otra':'Anotemos qué información falta para decidir.'};state.nextStep=guidance[state.reason]||'';assign('gaThinkNext',state.nextStep);if(state.reason==='Quiero empezar más adelante'){wait.open=true;wait.scrollIntoView({behavior:'smooth',block:'nearest'})}if(state.reason==='Quiero estar seguro de con quién lo hago')existing('gaOpenCredentials')?.click();if(state.reason==='El monto')options.scrollIntoView({behavior:'smooth',block:'start'});if(state.reason==='No sé si tendré liquidez')window.GaOpenResponse?.(8);if(state.reason==='Platicarlo con mi pareja'){if(existing('gaOpeningParticipants'))existing('gaOpeningParticipants').value='Prospecto y pareja';}persist()}}
if(date){date.value=state.date;date.onchange=()=>{state.date=date.value;persist()}}if(time){time.value=state.time;time.onchange=()=>{state.time=time.value;persist()}}if(noDate){noDate.checked=state.noDate;noDate.onchange=()=>{state.noDate=noDate.checked;persist()}}
if(reason)reason.dispatchEvent(new Event('change'));
thinkButton.addEventListener('click',()=>{think.hidden=false;think.scrollIntoView({behavior:'smooth',block:'nearest'});});
existing('gaThinkConfirm')?.addEventListener('click',()=>{if(!state.reason||(!state.noDate&&(!state.date||!state.time))){assign('gaThinkError','Elige una razón y acuerda fecha y hora, o marca expresamente sin fecha.');return}assign('gaThinkError','Siguiente paso guardado en esta sesión.');persist();});
function summary(){return [existing('gaName')?.value||existing('nombreOpt')?.value||'','Aportación mensual: '+money(pmt()),'Monto proyectado a los 65: '+(existing('fondo65')?.textContent||'—'),existing('regimenFiscal')?.value==='151'&&existing('taxFirstAmount')?.textContent?'Beneficio fiscal estimado del primer año: '+existing('taxFirstAmount').textContent:'','Siguiente paso: '+(state.nextStep||'Por definir'),'Fecha acordada: '+(state.noDate?'Sin fecha acordada':(state.date+' '+state.time)),'Cualquier duda, aquí estoy. — Christian'].filter(Boolean).join('\n')}
existing('gaActCopy')?.addEventListener('click',()=>navigator.clipboard?.writeText(summary()));
existing('gaActDecision')?.addEventListener('click',()=>decisions?.scrollIntoView({behavior:'smooth',block:'start'}));
const mobile=make('button','ga-btn','Modo celular');mobile.id='gaThreeMobileToggle';
mobile.type='button';mobile.onclick=()=>{state.mobile=!state.mobile;document.body.classList.toggle('ga-three-mobile',state.mobile);mobile.textContent=state.mobile?'Vista normal':'Modo celular';persist()};
existing('gaActHero')?.prepend(mobile);
document.body.classList.toggle('ga-three-mobile',state.mobile);
if(state.mobile)mobile.textContent='Vista normal';
const responseIndex=[['¿Es seguro? ¿Quién respalda?',5],['¿Cómo funciona un PPR?',4],['¿Qué pasa si necesito el dinero o dejo de pagar?',8],['¿Cómo funciona el Art. 151?',8],['¿Cómo funciona el Art. 93?',8],['¿Y la volatilidad?',11],['¿Cuánto cuesta?',13],['¿Cómo se abre?',10]];
responseIndex.push(['¿Y si empiezo el próximo año?',0]);
const resourcePanel=existing('gaResourcesPanel');
const library=make('section','card');library.id='gaQuestionLibrary';library.innerHTML='<div class="ga-kicker">Biblioteca de respuestas</div><h3>¿Qué te gustaría resolver?</h3>';
responseIndex.forEach(([label,slide])=>{const btn=make('button','ga-btn',label);btn.type='button';btn.onclick=()=>{if(slide===0){resourcePanel?.classList.remove('show');wait.open=true;wait.scrollIntoView({behavior:'smooth',block:'start'})}else window.GaOpenResponse?.(slide)};library.append(btn,document.createTextNode(' '))});
const resourceCard=resourcePanel?.querySelector('.ga-resources-panel-card');if(resourceCard)resourceCard.prepend(library);
existing('gaOpenResources')?.addEventListener('click',()=>{library.hidden=classic()});
const hideClassic=()=>{const isClassic=classic();for(const el of [hero,options,detail,future,wait,thinkButton,mobile])if(el)el.hidden=isClassic; if(isClassic)think.hidden=true;document.body.classList.toggle('ga-three-classic',isClassic)};
extraCss.textContent+=' .ga-three-classic #gaActHero,.ga-three-classic #gaActOptions,.ga-three-classic #gaActGoal,.ga-three-classic #gaActTechnical,.ga-three-classic #gaActWait,.ga-three-classic #gaThreeMobileToggle{display:none!important}';
existing('gaFlowToggle')?.addEventListener('click',()=>{hideClassic()});
hideClassic();
const panelButton=make('button','ga-btn','Panel del asesor');panelButton.type='button';panelButton.id='gaAdvisorPanelButton';
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('garba-advisor-three-act'):null;
const panelState=()=>({act:workspace()?.classList.contains('active')?(decisions?.getBoundingClientRect().top<innerHeight/2?3:2):1,priority:document.querySelector('.ga-option.selected')?.textContent?.trim()||'',barrier:existing('gaBarrier')?.value||'',condition:existing('gaConcern')?.value||'',amount:pmt(),fiscal:existing('regimenFiscal')?.value||existing('gaTax')?.value||'',reason:state.reason});
const sendPanel=()=>{const msg={type:'state',data:panelState(),at:Date.now()};channel?.postMessage(msg);try{localStorage.setItem('gaAdvisorPanelSignal',JSON.stringify(msg))}catch(e){}};
panelButton.onclick=()=>{const w=window.open('advisor-panel.html','GarBaAdvisorPanel','popup=yes,width=360,height=560');if(w)w.focus();sendPanel()};
existing('gaFlowToggle')?.after(panelButton);
const signal=new MutationObserver(sendPanel);if(workspace())signal.observe(workspace(),{attributes:true,attributeFilter:['class']});
for(const key of ['gaBarrier','gaConcern','gaTax','gaPmt','pmt','gaThinkReason'])existing(key)?.addEventListener('change',sendPanel);
channel?.addEventListener('message',e=>{if(e.data?.type==='ready')sendPanel()});window.addEventListener('scroll',sendPanel,{passive:true});
const obs=new MutationObserver(()=>{if(!view()||comparing)return;const newVal=existing('fondo65')?.textContent;if(newVal!==hero.dataset.last){hero.dataset.last=newVal;refresh()}});
if(workspace())obs.observe(workspace(),{childList:true,subtree:true,characterData:true});
refresh();
window.GaThreeActs={state,refresh,summary};
})();
