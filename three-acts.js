/* Three-act decision layer; never modifies projection formulas. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const money=n=>Number(n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const state={reason:'',other:'',date:'',time:'',noDate:false,mobile:false,nextStep:''};
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
const detail=make('details','card');detail.id='gaActGoal';detail.innerHTML='<summary>Ver meta completa</summary>';const gap=existing('gaProjectionGap');const gapAnchor=document.createComment('gaProjectionGap original');if(gap){gap.before(gapAnchor);detail.append(gap)}
const future=make('details','card');future.id='gaActTechnical';future.innerHTML='<summary>Ver gráfica y tablas de detalle</summary>';
const graph=existing('gaProjectionGraph');const graphAnchor=document.createComment('gaProjectionGraph original');
if(graph){graph.before(graphAnchor);future.append(graph)}
const technicalNodes=['toggleTable','details','toggleTableRet','detailsRet'].map(existing).filter(Boolean);
const technicalAnchors=technicalNodes.map(el=>{const anchor=document.createComment('Original '+el.id);el.before(anchor);future.append(el);return anchor});
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
think.innerHTML='<h3>¿Qué te gustaría pensar?</h3><div class="ga-field"><select id="gaThinkReason"><option value="">Selecciona una razón</option>'+reasons.map(r=>'<option>'+r+'</option>').join('')+'</select></div><div class="ga-field" id="gaThinkOtherWrap" hidden><label>¿Qué necesitas revisar?</label><input id="gaThinkOther" type="text" placeholder="Escribe la razón"></div><div id="gaThinkNext"></div><div class="ga-field"><label>Fecha en que lo decidimos</label><input type="date" id="gaThinkDate"></div><div class="ga-field"><label>Hora</label><input type="time" id="gaThinkTime"></div><label><input type="checkbox" id="gaThinkNoDate"> Acordamos continuar sin fecha definida</label><div><button type="button" class="ga-btn" id="gaThinkConfirm">Guardar siguiente paso</button></div><p id="gaThinkError" role="status"></p>';
if(decisions)decisions.querySelector('.ga-close-question')?.after(think);
const reason=existing('gaThinkReason');const date=existing('gaThinkDate');const time=existing('gaThinkTime'),noDate=existing('gaThinkNoDate');
if(existing('gaThinkOther')){existing('gaThinkOther').value=state.other||'';existing('gaThinkOther').oninput=()=>{state.other=existing('gaThinkOther').value.trim();persist()}}if(reason){reason.value=state.reason;reason.onchange=()=>{state.reason=reason.value;existing('gaThinkOtherWrap').hidden=state.reason!=='Otra';const guidance={'El monto':'Regresemos a las opciones de aportación.','Platicarlo con mi pareja':'Agendemos una segunda cita con ambos.','Compararlo con otra opción':'Revisemos juntos esa otra propuesta en una segunda cita.','No sé si tendré liquidez':'Revisemos las condiciones y recursos de flexibilidad.','Quiero empezar más adelante':'Revisemos qué cambia al esperar.','Quiero estar seguro de con quién lo hago':'Revisemos las credenciales y el respaldo antes de avanzar.','Otra':'Anotemos qué información falta para decidir.'};state.nextStep=guidance[state.reason]||'';assign('gaThinkNext',state.nextStep);if(state.reason==='Quiero empezar más adelante'){wait.open=true;wait.scrollIntoView({behavior:'smooth',block:'nearest'})}if(state.reason==='Quiero estar seguro de con quién lo hago')existing('gaOpenCredentials')?.click();if(state.reason==='El monto')options.scrollIntoView({behavior:'smooth',block:'start'});if(state.reason==='No sé si tendré liquidez')window.GaOpenResponse?.(8);if(state.reason==='Platicarlo con mi pareja'){if(existing('gaOpeningParticipants'))existing('gaOpeningParticipants').value='Prospecto y pareja';}persist()}}
if(date){date.value=state.date;date.onchange=()=>{state.date=date.value;persist()}}if(time){time.value=state.time;time.onchange=()=>{state.time=time.value;persist()}}if(noDate){noDate.checked=state.noDate;noDate.onchange=()=>{state.noDate=noDate.checked;persist()}}
if(reason)reason.dispatchEvent(new Event('change'));
thinkButton.addEventListener('click',()=>{if(window.GaShell?.postCalcChecks){window.GaShell.postCalcChecks.decision='think';buttons?.querySelectorAll('[data-postcalc="decision"]').forEach(x=>x.classList.remove('selected'));thinkButton.classList.add('selected');window.GaUpdatePostCalcRecommendation?.()}think.hidden=false;think.scrollIntoView({behavior:'smooth',block:'nearest'});});
existing('gaThinkConfirm')?.addEventListener('click',()=>{if(!state.reason||(state.reason==='Otra'&&!state.other)||(!state.noDate&&(!state.date||!state.time))){assign('gaThinkError','Elige una razón y acuerda fecha y hora, o marca expresamente sin fecha.');return}assign('gaThinkError','Siguiente paso guardado en esta sesión.');persist();});
function summary(){return [existing('gaName')?.value||existing('nombreOpt')?.value||'','Aportación mensual: '+money(pmt()),'Monto proyectado a los 65: '+(existing('fondo65')?.textContent||'—'),existing('regimenFiscal')?.value==='151'&&existing('taxFirstAmount')?.textContent?'Beneficio fiscal estimado del primer año: '+existing('taxFirstAmount').textContent:'','Siguiente paso: '+(state.nextStep||'Por definir')+(state.reason==='Otra'&&state.other?' · '+state.other:''),'Fecha acordada: '+(state.noDate?'Sin fecha acordada':(state.date+' '+state.time)),'Cualquier duda, aquí estoy. — Christian'].filter(Boolean).join('\n')}
existing('gaActCopy')?.addEventListener('click',()=>navigator.clipboard?.writeText(summary()));
existing('gaActDecision')?.addEventListener('click',()=>decisions?.scrollIntoView({behavior:'smooth',block:'start'}));
const mobile=make('button','ga-btn','Modo celular');mobile.id='gaThreeMobileToggle';mobile.type='button';
existing('gaActHero')?.prepend(mobile);
const decisionAnchor=document.createComment('Original decision position');
if(decisions)decisions.before(decisionAnchor);
const mobileDeck=make('section','ga-mobile-deck');mobileDeck.id='gaMobileDeck';mobileDeck.hidden=true;
mobileDeck.innerHTML='<header class="ga-kicker">Asesoría · 3 actos <button class="ga-btn" id="gaMobileExit">Salir del modo celular</button></header><article class="card ga-mobile-stage"><div class="ga-kicker">1 · Tu número</div><h2>Aportación mensual</h2><p class="ga-mobile-number" id="gaMobilePmt">—</p><h2>Capital estimado a los 65</h2><p class="ga-mobile-number" id="gaMobileFuture">—</p></article><article class="card ga-mobile-stage" hidden><div class="ga-kicker">2 · Beneficio fiscal</div><h2>Tratamiento fiscal del plan</h2><p id="gaMobileFiscal">—</p></article><article class="card ga-mobile-stage" hidden><div class="ga-kicker">3 · Opciones de arranque</div><h2>¿Con cuánto comenzar?</h2><div id="gaMobileOptions"></div></article><article class="card ga-mobile-stage" hidden><div class="ga-kicker">4 · Decisión</div><div id="gaMobileDecision"></div></article><footer class="ga-mobile-controls"><button class="ga-btn" id="gaMobilePrev">← Anterior</button><span id="gaMobileCount">1 de 4</span><button class="ga-btn" id="gaMobileNext">Siguiente →</button><button class="ga-btn" id="gaMobileCopy">Copiar resumen</button></footer>';
document.body.append(mobileDeck);
extraCss.textContent+=' .ga-mobile-deck{position:fixed;inset:0;z-index:9998;overflow:auto;padding:20px clamp(18px,4vw,60px);background:#fff;color:var(--presentation-navy,#001868)}.ga-mobile-deck[hidden],.ga-mobile-stage[hidden]{display:none!important}.ga-mobile-deck header{display:flex;justify-content:space-between;align-items:center;gap:10px}.ga-mobile-deck .ga-mobile-number{font-size:clamp(60px,5vw,76px);font-weight:800;line-height:1.14;margin:14px 0}.ga-mobile-deck #gaMobileFiscal{font-size:clamp(30px,3vw,46px);line-height:1.25;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.ga-mobile-controls{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:15px 0 60px}.ga-mobile-stage{min-height:60vh}.ga-mobile-deck .ga-close-options{grid-template-columns:1fr 1fr}.ga-mobile-deck #gaPostCalcValidation{display:block!important}@media(max-width:600px){.ga-mobile-deck .ga-close-options{grid-template-columns:1fr}}';
let mobilePage=0;
const stages=[...mobileDeck.querySelectorAll('.ga-mobile-stage')];
function updateDeck(){
 assign('gaMobilePmt',existing('gaActPmt')?.textContent||'—');assign('gaMobileFuture',existing('gaActFuture')?.textContent||'—');
 assign('gaMobileFiscal',existing('gaActFiscal')?.textContent||'Consulta los beneficios de tu escenario.');
 const wrap=existing('gaMobileOptions');if(wrap){wrap.replaceChildren();existing('gaActOptionCards')?.querySelectorAll('.ga-act-option').forEach(source=>{const row=make('div','ga-act-option');const amount=make('strong','',source.querySelector('strong')?.textContent||'');const result=make('p','',source.querySelector('.ga-mini')?.textContent||'');const choose=make('button','ga-btn','Elegir este');choose.onclick=()=>{source.querySelector('button')?.click();updateDeck()};row.append(amount,result,choose);wrap.append(row)})}
 stages.forEach((el,i)=>el.hidden=i!==mobilePage);assign('gaMobileCount',(mobilePage+1)+' de 4');
}
function syncDeck(){
 const active=state.mobile&&!classic()&&workspace()?.classList.contains('active');
 mobileDeck.hidden=!active;document.body.classList.toggle('ga-three-mobile',active);
 if(active){existing('gaMobileDecision')?.append(decisions);updateDeck()}else if(decisions&&decisionAnchor.parentNode)decisionAnchor.parentNode.insertBefore(decisions,decisionAnchor.nextSibling);
 mobile.textContent=state.mobile?'Vista normal':'Modo celular';
}
mobile.onclick=()=>{state.mobile=!state.mobile;persist();syncDeck()};
existing('gaMobileExit').onclick=()=>{state.mobile=false;persist();syncDeck()};
existing('gaMobilePrev').onclick=()=>{mobilePage=Math.max(0,mobilePage-1);updateDeck();mobileDeck.scrollTo(0,0)};
existing('gaMobileNext').onclick=()=>{mobilePage=Math.min(3,mobilePage+1);updateDeck();mobileDeck.scrollTo(0,0)};
existing('gaMobileCopy').onclick=()=>navigator.clipboard?.writeText(summary());
new MutationObserver(syncDeck).observe(workspace(),{attributes:true,attributeFilter:['class']});
syncDeck();
const responseIndex=[['¿Es seguro? ¿Quién respalda?',5],['¿Cómo funciona un PPR?',4],['¿Qué pasa si necesito el dinero o dejo de pagar?',8],['¿Cómo funciona el Art. 151?',8,'151'],['¿Cómo funciona el Art. 93?',8,'93'],['¿Y la volatilidad?',11],['¿Cuánto cuesta?',13],['¿Cómo se abre?',10]];
responseIndex.push(['¿Y si empiezo el próximo año?',0]);
const resourcePanel=existing('gaResourcesPanel');
const resourceAnchor=document.createComment('Original library location');
if(resourcePanel)resourcePanel.before(resourceAnchor);
const libraryButton=make('button','ga-btn','📚 Biblioteca de respuestas');libraryButton.type='button';libraryButton.id='gaActLibraryButton';
libraryButton.style.cssText='position:fixed;bottom:12px;left:153px;z-index:99999;opacity:.75;font-size:11px;padding:8px 11px';
document.body.append(libraryButton);
libraryButton.onclick=()=>existing('gaOpenResources')?.click();
const library=make('section','card');library.id='gaQuestionLibrary';library.innerHTML='<div class="ga-kicker">Biblioteca de respuestas</div><h3>¿Qué te gustaría resolver?</h3>';
const responseButtons=[];
responseIndex.forEach(([label,slide,fiscal])=>{const btn=make('button','ga-btn',label);btn.type='button';btn.dataset.slide=String(slide);btn.onclick=()=>{if(slide===0){resourcePanel?.classList.remove('show');wait.open=true;wait.scrollIntoView({behavior:'smooth',block:'start'})}else{window.GaOpenResponse?.(slide);if(fiscal){window.GaSupport?.show('fiscal');const host=existing('gaSupportContent');if(host)host.dataset.fiscalFilter=fiscal}else{const host=existing('gaSupportContent');if(host)delete host.dataset.fiscalFilter}}};responseButtons.push(btn);library.append(btn,document.createTextNode(' '))});
extraCss.textContent+=' #gaSupportContent[data-fiscal-filter="151"] .support-fiscal section:nth-child(2),#gaSupportContent[data-fiscal-filter="93"] .support-fiscal section:nth-child(1){display:none!important}#gaQuestionLibrary button{margin:3px}#gaQuestionLibrary button.ga-relevant{font-weight:900}';
function prioritizeResponses(){const relevant=new Set(window.GaRelatedSlides?.()||[]);for(const button of responseButtons)button.classList.toggle('ga-relevant',relevant.has(Number(button.dataset.slide)));responseButtons.sort((a,b)=>(Number(relevant.has(Number(b.dataset.slide)))-Number(relevant.has(Number(a.dataset.slide)))));for(const button of responseButtons)library.append(button,document.createTextNode(' '))}

const resourceCard=resourcePanel?.querySelector('.ga-resources-panel-card');if(resourceCard)resourceCard.prepend(library);
const mobileResourceCopy=make('button','ga-btn','Te lo mando por WhatsApp · copiar información');mobileResourceCopy.id='gaMobileLibraryCopy';mobileResourceCopy.type='button';
mobileResourceCopy.onclick=()=>{const title=existing('gaSlideTitle')?.textContent||'';const content=existing('gaSupportContent')?.innerText||existing('gaSlideReason')?.textContent||'';navigator.clipboard?.writeText([title,content,'Cualquier duda, aquí estoy. — Christian'].filter(Boolean).join('\\n'))};
if(resourceCard)library.after(mobileResourceCopy);
extraCss.textContent+=' #gaMobileLibraryCopy{display:none}.ga-three-mobile #gaMobileLibraryCopy{display:inline-flex;margin:10px 0}.ga-three-mobile #gaSlideTitle{font-size:clamp(26px,4vw,40px)}.ga-three-mobile #gaSupportContent{max-height:185px;overflow:hidden}.ga-three-mobile #gaSupportContent p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}';
existing('gaOpenResources')?.addEventListener('click',()=>{library.hidden=classic();if(!classic())prioritizeResponses()});
const hideClassic=()=>{const isClassic=classic();libraryButton.hidden=isClassic;libraryButton.style.display=isClassic?'none':'';if(isClassic){if(resourcePanel&&resourceAnchor.parentNode)resourceAnchor.parentNode.insertBefore(resourcePanel,resourceAnchor.nextSibling)}else if(resourcePanel)document.body.append(resourcePanel);for(const el of [hero,options,detail,future,wait,thinkButton,mobile])if(el)el.hidden=isClassic;thinkButton.style.display=isClassic?'none':'';if(isClassic){think.hidden=true;if(graph&&graphAnchor.parentNode)graphAnchor.parentNode.insertBefore(graph,graphAnchor.nextSibling);if(gap&&gapAnchor.parentNode)gapAnchor.parentNode.insertBefore(gap,gapAnchor.nextSibling);technicalNodes.forEach((el,i)=>{if(technicalAnchors[i].parentNode)technicalAnchors[i].parentNode.insertBefore(el,technicalAnchors[i].nextSibling)})}else{if(graph)future.append(graph);if(gap)detail.append(gap);technicalNodes.forEach(el=>future.append(el))}document.body.classList.toggle('ga-three-classic',isClassic);syncDeck()};
extraCss.textContent+=' .ga-three-classic #gaActHero,.ga-three-classic #gaActOptions,.ga-three-classic #gaActGoal,.ga-three-classic #gaActTechnical,.ga-three-classic #gaActWait,.ga-three-classic #gaActLibraryButton,.ga-three-classic #gaThreeMobileToggle{display:none!important}';
existing('gaFlowToggle')?.addEventListener('click',()=>{hideClassic()});
if(existing('gaFlowToggle'))existing('gaFlowToggle').style.display='none';
hideClassic();
const panelButton=make('button','ga-btn','Panel del asesor');panelButton.type='button';panelButton.id='gaAdvisorPanelButton';
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('garba-advisor-three-act'):null;
const panelState=()=>({act:workspace()?.classList.contains('active')?(decisions?.getBoundingClientRect().top<innerHeight/2?3:2):(document.querySelector('.ga-scene.active')?.dataset.scene==='0'?0:1),classic:classic(),priority:document.querySelector('.ga-option.selected')?.textContent?.trim()||'',barrier:existing('gaBarrier')?.value||'',condition:existing('gaConcern')?.value||'',amount:pmt(),fiscal:existing('regimenFiscal')?.value||existing('gaTax')?.value||'',reason:state.reason});
let advisorPhase=0,advisorPhaseSince=Date.now(),advisorElapsed={1:0,2:0,3:0};
try{const old=JSON.parse(sessionStorage.getItem('gaAdvisorPhase')||'null');if(old){advisorPhase=old.act;advisorPhaseSince=old.since;advisorElapsed=old.elapsed||advisorElapsed}}catch(e){}
const sendPanel=()=>{const d=panelState(),now=Date.now();if(d.act!==advisorPhase){if(advisorPhase>0)advisorElapsed[advisorPhase]=(advisorElapsed[advisorPhase]||0)+Math.max(0,now-advisorPhaseSince);advisorPhase=d.act;advisorPhaseSince=now}d.phaseSince=advisorPhaseSince;d.elapsed={...advisorElapsed};if(advisorPhase>0)d.elapsed[advisorPhase]+=Math.max(0,now-advisorPhaseSince);try{sessionStorage.setItem('gaAdvisorPhase',JSON.stringify({act:advisorPhase,since:advisorPhaseSince,elapsed:advisorElapsed}))}catch(e){}const msg={type:'state',data:d,at:now};channel?.postMessage(msg);try{localStorage.setItem('gaAdvisorPanelSignal',JSON.stringify(msg))}catch(e){}};
panelButton.onclick=()=>{const w=window.open('advisor-panel.html','GarBaAdvisorPanel','popup=yes,width=360,height=560');if(w)w.focus();sendPanel()};
document.body.append(panelButton);panelButton.style.cssText='position:fixed;left:12px;bottom:12px;z-index:99999;opacity:.65;font-size:11px;padding:8px 11px';
const signal=new MutationObserver(sendPanel);if(workspace())signal.observe(workspace(),{attributes:true,attributeFilter:['class']});
for(const key of ['gaBarrier','gaConcern','gaTax','gaPmt','pmt','gaThinkReason'])existing(key)?.addEventListener('change',sendPanel);
channel?.addEventListener('message',e=>{if(e.data?.type==='ready')sendPanel();if(e.data?.type==='flow-toggle'){existing('gaFlowToggle')?.click();sendPanel()}});window.addEventListener('storage',e=>{if(e.key==='gaAdvisorPanelCommand'){try{const command=JSON.parse(e.newValue);if(command?.type==='flow-toggle'){existing('gaFlowToggle')?.click();sendPanel()}}catch(err){}}});window.addEventListener('scroll',sendPanel,{passive:true});const diagnosticScenes=document.querySelectorAll('.ga-scene');for(const scene of diagnosticScenes){new MutationObserver(sendPanel).observe(scene,{attributes:true,attributeFilter:['class']})}
const obs=new MutationObserver(()=>{if(!view()||comparing)return;const newVal=existing('fondo65')?.textContent;if(newVal!==hero.dataset.last){hero.dataset.last=newVal;refresh();if(state.mobile)updateDeck()}});
if(workspace())obs.observe(workspace(),{childList:true,subtree:true,characterData:true});
refresh();
window.GaThreeActs={state,refresh,summary};
})();
