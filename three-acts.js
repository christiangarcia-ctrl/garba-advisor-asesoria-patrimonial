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
extraCss.textContent='.ga-act-hero{margin:18px 0}.ga-act-hero p{font-size:clamp(22px,3.4vw,48px);line-height:1.25;font-weight:700}.ga-act-hero strong{color:var(--presentation-navy,#001868)}.ga-act-actions{display:flex;flex-wrap:wrap;gap:12px}.ga-act-option{padding:16px;border:1px solid var(--presentation-line,#dce3ee);border-radius:14px;margin:8px 0}.ga-act-option strong{display:block;font-size:24px}.ga-think-panel{padding:18px;margin-top:16px}.ga-think-panel .ga-field{margin:12px 0}.ga-three-mobile .ga-act-hero p{font-size:clamp(60px,5vw,76px)}.ga-three-mobile .projection-graph,.ga-three-mobile .ga-act-technical{display:none}.ga-three-mobile #gaActTechnical{display:none}.ga-three-mobile #gaActOptions .ga-act-option strong{font-size:42px}.ga-three-mobile #gaActHero{padding:24px}.ga-think-panel[hidden]{display:none!important}';
document.head.append(extraCss);
function refresh(){
 const amount=pmt();assign('gaActPmt',money(amount));assign('gaActFuture',existing('fondo65')?.textContent||'—');
 const tax=existing('regimenFiscal')?.value;const fiscal=existing('gaActFiscal');
 if(fiscal)fiscal.textContent=tax==='151'?'Consulta el beneficio fiscal anual en los resultados de esta proyección.':tax==='93'?'Consulta el tratamiento del Art. 93 en los resultados de esta proyección.':'';
 const candidates=[amount];const suggested=Number((existing('gaSuggestedMini')?.textContent||'').replace(/[^\d.-]/g,''))||0;
 if(suggested>amount){const intermediate=Math.round(((amount+suggested)/2)/500)*500;if(intermediate>amount&&intermediate<suggested)candidates.push(intermediate);candidates.push(suggested)}
 const wrap=existing('gaActOptionCards');if(wrap){wrap.replaceChildren();for(const n of [...new Set(candidates)].filter(n=>n>0)){const row=make('div','ga-act-option');const label=make('strong','',money(n)+'/mes');const btn=make('button','ga-btn','Elegir este');btn.type='button';btn.onclick=()=>{if(!existing('pmt'))return;existing('pmt').value=n;existing('pmt').dispatchEvent(new Event('input',{bubbles:true}));existing('pmt').dispatchEvent(new Event('change',{bubbles:true}));existing('gaPmt').value=n;refresh();persist()};row.append(label,btn);wrap.append(row)}}
}
const decisions=existing('gaPostCalcValidation');
const thinkButton=make('button','','');thinkButton.type='button';thinkButton.dataset.postcalc='decision';thinkButton.dataset.value='think';thinkButton.innerHTML='<strong>Necesito pensarlo</strong><span>Identifiquemos qué te falta para tomar una decisión.</span>';
const buttons=decisions?.querySelector('.ga-close-options');if(buttons)buttons.append(thinkButton);
const think=make('div','ga-think-panel card');think.id='gaThinkPanel';think.hidden=true;
const reasons=['El monto','Platicarlo con mi pareja','Compararlo con otra opción','No sé si tendré liquidez','Quiero empezar más adelante','Quiero estar seguro de con quién lo hago','Otra'];
think.innerHTML='<h3>¿Qué te gustaría pensar?</h3><div class="ga-field"><select id="gaThinkReason"><option value="">Selecciona una razón</option>'+reasons.map(r=>'<option>'+r+'</option>').join('')+'</select></div><div id="gaThinkNext"></div><div class="ga-field"><label>Fecha en que lo decidimos</label><input type="date" id="gaThinkDate"></div><div class="ga-field"><label>Hora</label><input type="time" id="gaThinkTime"></div><label><input type="checkbox" id="gaThinkNoDate"> Acordamos continuar sin fecha definida</label><div><button type="button" class="ga-btn" id="gaThinkConfirm">Guardar siguiente paso</button></div><p id="gaThinkError" role="status"></p>';
if(decisions)decisions.querySelector('.ga-close-question')?.after(think);
const reason=existing('gaThinkReason');const date=existing('gaThinkDate');const time=existing('gaThinkTime'),noDate=existing('gaThinkNoDate');
if(reason){reason.value=state.reason;reason.onchange=()=>{state.reason=reason.value;const guidance={'El monto':'Regresemos a las opciones de aportación.','Platicarlo con mi pareja':'Agendemos una segunda cita con ambos.','Compararlo con otra opción':'Revisemos juntos esa otra propuesta en una segunda cita.','No sé si tendré liquidez':'Revisemos las condiciones y recursos de flexibilidad.','Quiero empezar más adelante':'Revisemos qué cambia al esperar.','Quiero estar seguro de con quién lo hago':'Revisemos las credenciales y el respaldo antes de avanzar.','Otra':'Anotemos qué información falta para decidir.'};state.nextStep=guidance[state.reason]||'';assign('gaThinkNext',state.nextStep);if(state.reason==='Platicarlo con mi pareja'){if(existing('gaOpeningParticipants'))existing('gaOpeningParticipants').value='Prospecto y pareja';}persist()}}
if(date){date.value=state.date;date.onchange=()=>{state.date=date.value;persist()}}if(time){time.value=state.time;time.onchange=()=>{state.time=time.value;persist()}}if(noDate){noDate.checked=state.noDate;noDate.onchange=()=>{state.noDate=noDate.checked;persist()}}
if(reason)reason.dispatchEvent(new Event('change'));
thinkButton.addEventListener('click',()=>{think.hidden=false;think.scrollIntoView({behavior:'smooth',block:'nearest'});});
existing('gaThinkConfirm')?.addEventListener('click',()=>{if(!state.reason||(!state.noDate&&(!state.date||!state.time))){assign('gaThinkError','Elige una razón y acuerda fecha y hora, o marca expresamente sin fecha.');return}assign('gaThinkError','Siguiente paso guardado en esta sesión.');persist();});
function summary(){return [existing('gaName')?.value||existing('nombreOpt')?.value||'','Aportación mensual: '+money(pmt()),'Monto proyectado a los 65: '+(existing('fondo65')?.textContent||'—'),'Siguiente paso: '+(state.nextStep||'Por definir'),'Fecha acordada: '+(state.noDate?'Sin fecha acordada':(state.date+' '+state.time)),'Cualquier duda, aquí estoy. — Christian'].filter(Boolean).join('\n')}
existing('gaActCopy')?.addEventListener('click',()=>navigator.clipboard?.writeText(summary()));
existing('gaActDecision')?.addEventListener('click',()=>decisions?.scrollIntoView({behavior:'smooth',block:'start'}));
const mobile=make('button','ga-btn','Modo celular');mobile.id='gaThreeMobileToggle';
mobile.type='button';mobile.onclick=()=>{state.mobile=!state.mobile;document.body.classList.toggle('ga-three-mobile',state.mobile);mobile.textContent=state.mobile?'Vista normal':'Modo celular';persist()};
existing('gaActHero')?.prepend(mobile);
document.body.classList.toggle('ga-three-mobile',state.mobile);
if(state.mobile)mobile.textContent='Vista normal';
const obs=new MutationObserver(()=>{if(!view())return;const newVal=existing('fondo65')?.textContent;if(newVal!==hero.dataset.last){hero.dataset.last=newVal;refresh()}});
if(workspace())obs.observe(workspace(),{childList:true,subtree:true,characterData:true});
refresh();
window.GaThreeActs={state,refresh,summary};
})();
