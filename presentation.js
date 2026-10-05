/* Live presentation of the existing calculator. No financial formulas live here. */
(function(){
  'use strict';
  const byId=id=>document.getElementById(id);
  const app=byId('legacyApp'),capture=byId('captureView'),results=byId('resultsView');
  const fieldIds=['nombreOpt','edad','years','metaHoy','pmt','lumpSum','regimenFiscal','ingresoMensualCliente','reinvertISR','rate','inflation'];
  const status=byId('gaLiveStatus');
  let timer=null,lastSignature=null,current=false;
  const disabledBeforePending=new Map();
  const signature=()=>JSON.stringify(fieldIds.map(id=>{const el=byId(id);return el.type==='checkbox'?el.checked:el.value}));
  const visible=()=>app.style.display!=='none';

  function setStatus(text,state){
    if(status.textContent!==text)status.textContent=text;
    status.dataset.state=state;
  }
  function setPending(message){
    current=false;app.classList.add('ga-live-pending');
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
    capture.scrollTo({top:0,behavior:'smooth'});
    if(matchMedia('(max-width:760px)').matches)capture.scrollIntoView({block:'start',behavior:'smooth'});
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
  let restoreFocus=null;
  function closeResources(){panel.classList.remove('show')}
  new MutationObserver(()=>{
    const open=panel.classList.contains('show');
    document.body.classList.toggle('ga-resources-open',open);
    panel.setAttribute('aria-hidden',String(!open));
    if(open){restoreFocus=document.activeElement;close.focus()}
    else if(restoreFocus?.isConnected){restoreFocus.focus({preventScroll:true});restoreFocus=null}
  }).observe(panel,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(!panel.classList.contains('show'))return;
    if(event.key==='Escape'){event.preventDefault();closeResources();return}
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
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
