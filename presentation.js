/* Live presentation of the existing calculator. No financial formulas live here. */
(function(){
  'use strict';
  const byId=id=>document.getElementById(id);
  const app=byId('legacyApp'),capture=byId('captureView'),results=byId('resultsView');
  const fieldIds=['nombreOpt','edad','years','metaHoy','pmt','lumpSum','regimenFiscal','ingresoMensualCliente','reinvertISR','rate','inflation'];
  const status=byId('gaLiveStatus');
  const chartCard=byId('chartCanvas').closest('.card');
  byId('gaProjectionGraph').append(chartCard);
  const actions=document.querySelector('#resultsView .action-row');
  const hero=document.querySelector('#resultsView .plan-hero');
  hero.after(actions);
  const assumptions=byId('regimenFiscal').closest('.block');
  const disclosure=document.createElement('details');disclosure.className='calculator-assumptions';
  const summary=document.createElement('summary');summary.textContent='Ajustar supuestos y régimen fiscal';
  assumptions.before(disclosure);disclosure.append(summary,assumptions);
  const disclaimer=document.querySelector('#captureView .disclaimer-inline');
  const about=document.createElement('details');about.className='calculator-about';
  about.innerHTML='<summary>Sobre esta proyección</summary>';disclaimer.before(about);about.append(disclaimer);

  const timeline=document.createElement('div');timeline.className='calculator-timeline';
  byId('pmt').closest('.block').append(timeline);
  const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value);
  function presentProjection(){
    if(!current)return;
    const age=Number(byId('edad').value),years=reportState.planYears;
    timeline.innerHTML=`<strong>Hoy: ${age} años</strong> → aportas ${years} años → <strong>terminas a los ${age+years}</strong><br>Proyección de retiro: <strong>65 años</strong>${age+years<65?' · después continúa el crecimiento sin aportaciones':''}`;
    const meta=Number(byId('metaHoy').value)||0,infl=Number(byId('inflation').value)/100;
    // Same retirement annuity assumptions used by calcularPMTRequerido: age 65, 20 years, 7%, monthly.
    const monthlyGoal=meta*Math.pow(1+infl,Math.max(0,65-age));
    const i=reportState.rRet/100/12,n=reportState.yrsRet*12;
    const target=monthlyGoal*(Math.abs(i)<1e-12?n:(1-Math.pow(1+i,-n))/i);
    const projected=reportState.fondo65,gap=Math.max(0,target-projected),coverage=target>0?projected/target*100:null;
    const suggested=reportState.pmtSugerido;
    byId('gaProjectionGap').innerHTML=target>0?`<div><span>Capital objetivo a los 65</span><strong>${money(target)}</strong><small>Para tu ingreso deseado durante 20 años</small></div><div><span>${gap>0?'Brecha por cubrir':'Excedente sobre la meta'}</span><strong>${money(gap>0?gap:Math.max(0,projected-target))}</strong><small>Comparación en pesos futuros a los 65</small></div><div><span>Aportación inicial sugerida</span><strong>${money(suggested)}/mes</strong><small>Referencia con los supuestos de tu calculadora</small><button id="gaTrySuggested" type="button">Probar esta aportación</button></div><div class="projection-coverage"><meter min="0" max="100" value="${Math.min(100,coverage)}" aria-label="Cobertura estimada del capital objetivo"></meter><p><b>${Math.round(coverage)}% del capital objetivo</b> · cobertura estimada, sujeta a los supuestos de la proyección.</p></div>`:'<div><span>Define tu ingreso deseado para comparar la proyección con una meta.</span></div>';
    byId('gaTrySuggested')?.addEventListener('click',()=>{byId('pmt').value=suggested.toFixed(2);byId('pmt').dispatchEvent(new Event('input',{bubbles:true}));refresh({force:true})});
    if(typeof chart!=='undefined'&&chart){
      chart.data.datasets[0].borderColor='#8bafff';chart.data.datasets[0].backgroundColor='rgba(139,175,255,.14)';
      chart.data.datasets=chart.data.datasets.slice(0,1);
      if(target>0)chart.data.datasets.push({label:'Capital objetivo a los 65',data:chart.data.labels.map(()=>target),borderColor:'#d2dced',borderDash:[6,6],borderWidth:1.5,pointRadius:0,fill:false});
      chart.options.maintainAspectRatio=false;
      chart.options.scales.x.ticks.color='#c7d2e4';chart.options.scales.y.ticks.color='#c7d2e4';chart.options.scales.y.grid.color='#ffffff18';
      chart.options.plugins.tooltip.callbacks.label=ctx=>`${ctx.dataset.label}: ${money(ctx.parsed.y)}`;
      chart.update('none');
    }
    window.GaLayout?.update(coverage,target);
  }
  let timer=null,lastSignature=null,current=false;
  const disabledBeforePending=new Map();
  const signature=()=>JSON.stringify(fieldIds.map(id=>{const el=byId(id);return el.type==='checkbox'?el.checked:el.value}));
  const visible=()=>app.style.display!=='none';

  function setStatus(text,state){
    if(status.textContent!==text)status.textContent=text;
    status.dataset.state=state;
  }
  function setPending(message){
    current=false;app.classList.add('ga-live-pending');window.GaLayout?.identity();
    setStatus(message,'pending');
    results.querySelectorAll('button').forEach(button=>{
      if(button.id==='gaExitToShell'||button.id==='editBtn')return;
      if(!disabledBeforePending.has(button))disabledBeforePending.set(button,button.disabled);
      button.disabled=true;
    });
    byId('gaMobileAmount').textContent='—';
    byId('gaMobileLabel').textContent='Completa los datos para actualizar';
  }
  function setCurrent(){
    current=true;app.classList.remove('ga-live-pending');
    disabledBeforePending.forEach((disabled,button)=>{if(button.isConnected)button.disabled=disabled});
    disabledBeforePending.clear();
    setStatus('Resultados actualizados al ajustar tus datos.','current');
    byId('gaMobileAmount').textContent=byId('keyFondoPlan').textContent;
    byId('gaMobileLabel').textContent='Capital proyectado para retiro';
    presentProjection();
  }
  function numericInputsReady(){
    // Keep optional blank inputs at their existing zero/default behavior. Only avoid incomplete numbers.
    for(const id of ['edad','years','pmt','rate','inflation']){
      const el=byId(id);
      if(el.value.trim()===''||!Number.isFinite(Number(el.value))||el.validity.badInput)return false;
    }
    for(const id of ['metaHoy','lumpSum','ingresoMensualCliente'])if(byId(id).validity.badInput)return false;
    return true;
  }
  function refresh(options={}){
    clearTimeout(timer);
    if(!visible())return false;
    if(!numericInputsReady()){
      setPending('Completa el número que estás ajustando para actualizar los resultados.');
      return false;
    }
    if(!options.force&&current&&signature()===lastSignature)return true;
    try{
      updateSuggestion();
      if(!calcAccum()){
        setPending(byId('errorMsg').textContent||'Revisa los datos para actualizar los resultados.');
        return false;
      }
      capture.classList.add('active');results.classList.add('active');
      byId('gaPmt').value=byId('pmt').value;
      byId('gaGoal').value=byId('metaHoy').value;
      byId('gaAge').value=byId('edad').value;
      lastSignature=signature();setCurrent();
      requestAnimationFrame(()=>{if(typeof chart!=='undefined'&&chart)chart.resize()});
      document.dispatchEvent(new CustomEvent('ga:projection-updated'));
      return true;
    }catch(error){
      setPending('No pudimos actualizar la proyección. Revisa los datos e intenta de nuevo.');
      console.error('[GarBa presentación] Actualización:',error);
      return false;
    }
  }
  function focusInputs(){
    capture.classList.add('active');
    window.GaLayout?.select('projection');
    byId('pmt').focus({preventScroll:true});
  }
  function onAdjust(){
    if(!visible())return;
    setPending('Actualizando la proyección…');
    clearTimeout(timer);timer=setTimeout(refresh,160);
  }
  fieldIds.forEach(id=>{
    const el=byId(id);
    el.addEventListener('input',onAdjust);
    el.addEventListener('change',()=>{if(visible())refresh()});
  });
  // Export and decision actions must use the latest completed projection, including within the debounce window.
  results.addEventListener('click',event=>{
    const target=event.target.closest('button,a');
    if(!target||['gaExitToShell','editBtn'].includes(target.id))return;
    if(!refresh()){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  new MutationObserver(()=>{
    if(!visible())return;
    capture.classList.add('active');
    if(results.classList.contains('active')&&numericInputsReady()){
      lastSignature=signature();setCurrent();
      requestAnimationFrame(()=>{if(typeof chart!=='undefined'&&chart)chart.resize()});
    }else refresh({force:true});
  }).observe(app,{attributes:true,attributeFilter:['style']});
  byId('gaMobileResults').addEventListener('click',()=>results.scrollIntoView({behavior:'smooth',block:'start'}));
  window.GaPresentation={refresh,focusInputs,isCurrent:()=>current};

  /* Full-page resources: keyboard navigation, focus containment and return to the opening control. */
  const panel=byId('gaResourcesPanel'),close=byId('gaResourcesClose');
  let restoreFocus=null,resourcesWereOpen=false;
  function closeResources(){panel.classList.remove('show')}
  new MutationObserver(()=>{
    const open=panel.classList.contains('show');
    if(open===resourcesWereOpen)return;
    resourcesWereOpen=open;
    document.body.classList.toggle('ga-resources-open',open);
    panel.setAttribute('aria-hidden',String(!open));
    if(open){restoreFocus=document.activeElement;close.focus()}
    else if(restoreFocus?.isConnected){restoreFocus.focus({preventScroll:true});restoreFocus=null}
  }).observe(panel,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(!panel.classList.contains('show'))return;
    if(event.key==='Escape'){event.preventDefault();if(!window.GaSupport?.back())closeResources();return}
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      if(event.target.closest('#gaSupportContent button'))return;
      event.preventDefault();byId(event.key==='ArrowRight'?'gaSlideNext':'gaSlidePrev').click();return;
    }
    if(event.key==='Tab'){
      const controls=[...panel.querySelectorAll('button,a,input,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first?.focus()}
    }
  });
})();
