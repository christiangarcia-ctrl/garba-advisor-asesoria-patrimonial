/* Run with Playwright available via NODE_PATH. Uses only synthetic data and a local server. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const baseline=process.env.ADVISOR_BASELINE;
const output=process.env.ADVISOR_TEST_OUTPUT||path.join(require('node:os').tmpdir(),'advisor-design-checks');
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const isBefore=url.pathname.startsWith('/round2-before/');
  const isBaseline=url.pathname.startsWith('/baseline/');
  const name=(decodeURIComponent(url.pathname.replace(isBefore?'/round2-before/':isBaseline?'/baseline/':'/',''))||'index.html').replace(/\/$/,'/index.html');
  const base=isBefore?process.env.ADVISOR_ROUND2_BEFORE:isBaseline?baseline:root;
  if(!base){res.writeHead(404).end();return;}
  const file=path.resolve(base,name);
  if(!file.startsWith(path.resolve(base)+path.sep)){res.writeHead(403).end();return;}
  const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
  try{const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':type});res.end(bytes)}catch{if(!res.headersSent)res.writeHead(404);res.end()}
});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function scaledCapture(page,name){
  const bytes=await page.screenshot();
  const data=await page.evaluate(async bytes=>{const bitmap=await createImageBitmap(new Blob([Uint8Array.from(atob(bytes),c=>c.charCodeAt(0))],{type:'image/png'}));const c=document.createElement('canvas');c.width=390;c.height=Math.round(bitmap.height*390/bitmap.width);c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);return c.toDataURL('image/png').split(',')[1]},bytes.toString('base64'));
  fs.writeFileSync(path.join(output,name),Buffer.from(data,'base64'));
}
async function round3Checks(page,setCase,output){
 const snap=async name=>page.screenshot({path:path.join(output,'ronda3-'+name+'.png')});
 await page.evaluate(()=>GaLayout.select('projection'));
 for(const reg of ['151','93','ninguno']){
  await setCase(page,{regimenFiscal:reg,edad:32,years:25,pmt:3000,ingresoMensualCliente:45000,reinvertISR:true});
  assert.equal(await page.locator('#gaPathsteps [data-s]').count(),reg==='ninguno'?5:6);assert.equal(await page.locator('#reinvertISR').isVisible(),reg==='151');
  const d=await page.evaluate(()=>({shown:document.getElementById('gaPathhNum').textContent,expected:'$'+Math.round(reportState.fondo65*(.07/12)/(1-Math.pow(1+.07/12,-240))).toLocaleString('es-MX')}));assert.equal(d.shown,d.expected);
  await page.evaluate(()=>GaPath.go(0));if(reg==='151')await snap('151-inicial');
  for(let step=1;step<=6&&reg!=='ninguno';step++){await page.evaluate(n=>GaPath.go(n),step);if(reg==='151'||step>=5)await snap(reg+'-paso-'+step);}
 }
 await setCase(page,{regimenFiscal:'151',years:25,pmt:3000,reinvertISR:true});
 await page.evaluate(()=>GaPath.go(0));await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>GaPath.getStep()),1);await page.keyboard.press('ArrowLeft');assert.equal(await page.evaluate(()=>GaPath.getStep()),0);
 await page.locator('[data-s="1"]').click();await page.locator('[data-s="1"]').click();assert.equal(await page.evaluate(()=>GaPath.getStep()),0);
 await page.evaluate(()=>GaPath.go(4));for(const chip of await page.locator('#gaPath [data-chip]').all()){await chip.click();assert(await chip.getAttribute('class').then(s=>s.includes('on')))}
 assert.deepEqual(await page.locator('#years option').evaluateAll(xs=>xs.map(x=>+x.value)),[10,15,20,25]);
 await page.evaluate(()=>{document.getElementById('years').value=30});assert.equal(await page.locator('#years').inputValue(),'25');
 for(const [years,pmt,bad] of [[10,2500,true],[15,2500,false],[20,1500,true]]){await setCase(page,{years,pmt});assert.equal(await page.locator('#pmt').getAttribute('aria-invalid'),String(bad));if(bad)await snap('rojo-'+years)}
 await setCase(page,{years:25,pmt:3000,regimenFiscal:'151',reinvertISR:true});const before=await page.evaluate(()=>reportState.fondo65);
 await setCase(page,{reinvertISR:false});await page.evaluate(()=>GaPath.go(5));assert(await page.evaluate(()=>reportState.devolucionFiscalPrimerAnoVista>0));assert((await page.evaluate(()=>reportState.fondo65))<before);await snap('sin-reinvertir');
 await page.locator('#gaPathiIng').fill('60000');await page.locator('#gaPathiIng').dispatchEvent('change');assert.equal(await page.locator('#ingresoMensualCliente').inputValue(),'60000');
 await page.evaluate(()=>{document.getElementById('ingresoMensualCliente').value=70000;document.getElementById('ingresoMensualCliente').dispatchEvent(new Event('input',{bubbles:true}));GaPresentation.refresh({force:true})});assert.equal(await page.locator('#gaPathiIng').inputValue(),'70000');
 await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>{document.getElementById('resultsView').scrollTop=0});
 // Tu camino (narración, cifra, gráfica y pasos) se ve completo sin desplazarse; la pregunta de cierre queda debajo.
 assert(await page.evaluate(()=>document.documentElement.scrollHeight<=900&&document.getElementById('gaPath').getBoundingClientRect().bottom<=Math.min(900,document.getElementById('resultsView').getBoundingClientRect().bottom)+1),'Tu camino cabe completo en 1440×900');
 await page.setViewportSize({width:390,height:844});for(const n of [0,3,5]){await page.evaluate(n=>GaPath.go(n),n);await snap('celular-paso-'+n)}await page.setViewportSize({width:1440,height:900});
}
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
  const errors=[];
  const make=async()=>{
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();
    page.on('pageerror',error=>{errors.push(error.message);console.error('Browser error:',error.message)});
    page.on('dialog',dialog=>dialog.dismiss());
    await page.route('https://**/*',route=>route.abort());
    return page;
  };
  const page=await make();
  const load=async(p,url,classic=true)=>{await p.goto(url+(classic?'?flujo=clasico':''));await wait(250)};
  const openCalc=async(p)=>{
    await p.evaluate(()=>{
      for(const [id,value] of Object.entries({gaName:'Cliente de prueba',gaAge:'32',gaRetireAge:'65',gaGoal:'25000',gaPmt:'3000',gaTax:'93'}))document.getElementById(id).value=value;
      if(window.GaPresentation)GaShell.openProposal();else GaShell.proceedOpenProposal();
    });
    await p.locator('#resultsView.active').waitFor();await wait(200);
  };
  const values=async(p)=>p.evaluate(()=>({
    report:Object.fromEntries(Object.entries(reportState).filter(([k])=>!['ingreso65','devolucionFiscalPrimerAnoVista'].includes(k))),table:document.getElementById('tbody').innerText,retirement:document.getElementById('tbodyRet').innerText,
    results:['keyFondoPlan','fondo65','etapaFondo60','pmtReal','pmtDesde60','compPlan','taxFirstAmount','isrImpacto65'].map(id=>{const e=document.getElementById(id);/* la tarjeta ISR oculta conserva texto de un escenario 151 anterior (comportamiento de main): solo se compara si está visible */const card=e?.closest('#isrInsightCard');return card&&getComputedStyle(card).display==='none'?'(oculta)':e?.textContent})
  }));
  const setCase=async(p,data)=>{
    await p.evaluate(data=>{
      for(const [id,value] of Object.entries(data)){
        const el=document.getElementById(id);if(el.type==='checkbox')el.checked=value;else el.value=String(value);
      }
      userEditedPMT=true;
      document.getElementById('regimenFiscal').dispatchEvent(new Event('change',{bubbles:true}));
      document.getElementById('ingresoMensualCliente').dispatchEvent(new Event('input',{bubbles:true}));
      if(window.GaPresentation)GaPresentation.refresh({force:true});else{updateSuggestion();calcAccum();}
    },data);
    await wait(200);
  };
  try{
    await load(page,origin);
    await page.screenshot({path:path.join(output,'intro-desktop.png')});
    assert.equal(await page.locator('.ga-card').evaluate(el=>Math.round(el.getBoundingClientRect().width)),1440,'Advisory uses full viewport width');
    assert.equal(await page.locator('.ga-intro-portrait').count(),0);
    await page.locator('#gaOpenResources').click();await wait(150);
    const panel=await page.locator('.ga-resources-panel-card').boundingBox();
    assert.deepEqual([Math.round(panel.width),Math.round(panel.height)],[1440,900]);
    await page.screenshot({path:path.join(output,'resources-desktop.png')});
    await page.locator('#gaAllSlides').click();
    const resourceBefore=await page.locator('#gaSlideImage').getAttribute('src');
    await page.keyboard.press('ArrowRight');await wait(100);
    assert.notEqual(await page.locator('#gaSlideImage').getAttribute('src'),resourceBefore);
    assert.equal(await page.locator('#gaSupportContent').getAttribute('data-view'),'retirement');
    await page.screenshot({path:path.join(output,'support-retirement-desktop.png')});
    for(let i=0;i<4;i++){await page.locator('#gaSlideNext').click();await wait(60)}
    assert.equal(await page.locator('#gaSupportContent').getAttribute('data-view'),'stages');
    await page.screenshot({path:path.join(output,'support-stages-desktop.png')});
    await page.locator('[data-support-view="investment"]').click();
    await page.screenshot({path:path.join(output,'support-investment-desktop.png')});
    await page.keyboard.press('Escape');
    await page.locator('[data-support-view="bonus"]').click();
    assert.equal(await page.locator('#gaSupportContent').getAttribute('data-view'),'bonus');
    await page.screenshot({path:path.join(output,'support-bonus-desktop.png')});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#gaSupportContent').getAttribute('data-view'),'stages');
    await page.locator('[data-support-view="fiscal"]').click();
    await page.screenshot({path:path.join(output,'support-fiscal-desktop.png')});
    await page.keyboard.press('Escape');
    await page.locator('[data-support-view="costs"]').click();
    await page.screenshot({path:path.join(output,'support-costs-desktop.png')});
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#gaResourcesPanel').evaluate(el=>el.classList.contains('show')),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'gaOpenResources');
    assert(await page.evaluate(()=>GaShell.scenes.find(s=>s.dataset.scene==='6').dataset.skip==='1'));
    await openCalc(page);
    assert(!await page.locator('#gaPlazoConfirm').evaluate(el=>el.classList.contains('show')));
    assert(await page.locator('#captureView').isVisible());
    assert(await page.locator('#resultsView').isVisible());
    await page.screenshot({path:path.join(output,'calculator-desktop.png')});
    assert(await page.locator('#gaProjectionGraph #chartCanvas').isVisible());
    assert.equal(await page.locator('#gaProjectionMilestones section').count(),3);
    assert.equal(await page.locator('#gaPane-projection .plan-strip').count(),0);
    assert.equal(await page.locator('#gaPane-detail .plan-strip').count(),1);
    assert((await page.locator('#gaProjectionMilestones').innerText()).includes('Fin de aportaciones'));
    assert(!(await page.locator('#gaProjectionMilestones').innerText()).includes('Etapa'));
    assert(await page.locator('#edad').evaluate(el=>el.readOnly));
    assert((await page.locator('#gaCalculatorTitle').innerText()).startsWith('Cliente,'));
    await page.locator('#gaMoreSettings').click();
    assert(await page.locator('#gaCalculatorSettings #rate').isVisible());
    assert(await page.locator('#gaCalculatorSettings').evaluate(el=>Math.abs(el.getBoundingClientRect().left-(innerWidth-el.getBoundingClientRect().width)/2)<2),'Settings dialog is centered');
    await page.screenshot({path:path.join(output,'calculator-settings-desktop.png')});
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'gaMoreSettings');
    await page.locator('#gaTab-gap').click();
    await page.screenshot({path:path.join(output,'calculator-gap-desktop.png')});
    assert((await page.locator('#gaProjectionGap').innerText()).includes('Brecha'));
    await page.locator('#gaTrySuggested').click();await wait(350);
    assert(await page.evaluate(()=>Math.abs(chart.data.datasets[0].data.at(-1)-chart.data.datasets[1].data.at(-1))<100),'Suggested contribution reaches the same capital target under the original non-deductible assumptions');
    await page.locator('#gaTab-projection').click();
    await page.locator('#pmt').fill('3000');await wait(350);
    const before=await page.locator('#keyFondoPlan').innerText();
    await page.locator('#pmt').fill('5000');await wait(350);
    assert.notEqual(await page.locator('#keyFondoPlan').innerText(),before,'input updates without simulation button');
    assert.equal(await page.evaluate(()=>GaPresentation.isCurrent()),true);
    const chartBefore=await page.evaluate(()=>chart.data.datasets[0].data.at(-1));
    await page.locator('#pmt').fill('6000');await wait(350);
    assert.notEqual(await page.evaluate(()=>chart.data.datasets[0].data.at(-1)),chartBefore,'chart updates with inputs');
    await page.locator('#pmt').fill('');await wait(250);
    assert.equal(await page.evaluate(()=>GaPresentation.isCurrent()),false);
    assert.equal(await page.locator('#printBtn').isDisabled(),true,'stale projection cannot be exported');
    await page.locator('#pmt').fill('3000');await wait(350);
    assert.equal(await page.locator('#printBtn').isDisabled(),false);
    await page.locator('#gaTab-detail').click();
    await page.locator('#editBtn').click();
    await page.locator('#gaTab-projection').click();
    assert(await page.locator('#resultsView').isVisible(),'adjust leaves results visible');

    if(baseline){
      const old=await make();await load(old,origin+'/baseline/index.html');await openCalc(old);
      const cases=[
        {regimenFiscal:'93',edad:32,years:15,metaHoy:25000,pmt:3000,lumpSum:0,rate:8.8,inflation:4,reinvertISR:false},
        {regimenFiscal:'ninguno',edad:45,years:10,metaHoy:32000,pmt:7500,lumpSum:100000,rate:10,inflation:5,reinvertISR:false},
        {regimenFiscal:'151',edad:35,years:20,metaHoy:40000,pmt:5000,lumpSum:0,rate:8.8,inflation:4,ingresoMensualCliente:100000,reinvertISR:true},
        {regimenFiscal:'151',edad:35,years:20,metaHoy:40000,pmt:5000,lumpSum:0,rate:8.8,inflation:4,ingresoMensualCliente:100000,reinvertISR:false},
        {regimenFiscal:'151',edad:29,years:30,metaHoy:60000,pmt:50000,lumpSum:250000,rate:8.8,inflation:4,ingresoMensualCliente:50000,reinvertISR:true},
        {regimenFiscal:'93',edad:59,years:15,metaHoy:20000,pmt:2500,lumpSum:250000,rate:8.8,inflation:4,reinvertISR:false},
        {regimenFiscal:'ninguno',edad:40,years:15,metaHoy:32000,pmt:3000,lumpSum:0,rate:0,inflation:0,reinvertISR:false}
      ];
      for(const data of cases){await setCase(old,data);await setCase(page,data);assert.deepEqual(await values(page),await values(old),'all original financial outputs remain identical')}
      console.log(`PASS: ${cases.length} financial scenarios match the original, including report and both detail tables.`);
      await old.close();
    }
    await setCase(page,{regimenFiscal:'93',edad:32,years:15,metaHoy:25000,pmt:3000,lumpSum:0,rate:8.8,inflation:4,reinvertISR:false});
    await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>window.scrollTo(0,0));await wait(200);
    await page.screenshot({path:path.join(output,'calculator-laptop.png')});
    for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
      await page.setViewportSize(viewport);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      assert(await page.locator('#captureView').evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Controls have no internal scrolling');
      assert(await page.locator('#resultsView').evaluate(el=>el.clientHeight>100),'Results have space in the viewport');
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('#captureView').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'calculator-mobile.png')});
    assert(await page.locator('#pmt').isVisible());
    const toolbarTop=await page.locator('.calculator-toolbar').evaluate(el=>el.getBoundingClientRect().top);
    await page.locator('#pmt').fill('4000');await wait(350);
    assert((await page.locator('#gaProjectedIncome').innerText()).includes('/mes'));
    await page.locator('#gaTab-detail').click();
    await page.locator('#resultsView').evaluate(el=>el.scrollTop=400);
    assert.equal(await page.locator('.calculator-toolbar').evaluate(el=>el.getBoundingClientRect().top),toolbarTop,'Controls stay fixed while results scroll');
    await page.screenshot({path:path.join(output,'results-mobile.png')});
    await page.locator('#gaExitToShell').click();await wait(1200);
    await page.evaluate(()=>GaShell.show(0));await wait(300);
    await page.screenshot({path:path.join(output,'intro-mobile.png')});
    await page.locator('#gaOpenResources').click();await wait(100);
    await page.screenshot({path:path.join(output,'resources-mobile.png')});
    await page.setViewportSize({width:844,height:390});await wait(500);
    await page.screenshot({path:path.join(output,'resources-mobile-landscape.png')});
    await page.locator('#gaAllSlides').click();await page.locator('#gaSlideNext').click();await wait(150);
    await page.screenshot({path:path.join(output,'support-retirement-landscape.png')});
    await page.setViewportSize({width:390,height:844});await wait(200);
    await page.screenshot({path:path.join(output,'support-retirement-mobile.png')});
    assert(await page.locator('#gaSupportContent').evaluate(el=>el.scrollWidth<=el.clientWidth),'Native support fits phone width');
    for(const view of ['ppr','investment','stages','bonus','costs','fiscal']){
      await page.evaluate(view=>GaSupport.show(view),view);await wait(100);
      assert(await page.locator('#gaSupportContent').evaluate(el=>el.scrollWidth<=el.clientWidth),view+' fits phone width');
      await page.screenshot({path:path.join(output,'support-'+view+'-mobile.png')});
    }
    await page.setViewportSize({width:844,height:390});await wait(200);
    assert.equal(await page.locator('.ga-resources-panel-card').evaluate(el=>Math.round(el.getBoundingClientRect().height)),390);
    const blank=await make();await load(blank,origin);
    await blank.evaluate(()=>{
      for(const [id,value] of Object.entries({gaName:'Cliente de prueba',gaAge:'32',gaRetireAge:'65',gaGoal:'25000',gaPmt:'',gaTax:'93'}))document.getElementById(id).value=value;
      GaShell.show(GaShell.scenes.findIndex(s=>s.dataset.scene==='5'));
    });
    assert.equal(await blank.evaluate(()=>GaShell.scenes[GaShell.nextIdx()].dataset.scene),'7','Main flow skips the old reality page');
    await blank.evaluate(()=>GaShell.openProposal());await wait(1100);
    assert(await blank.locator('#captureView').isVisible());
    assert.equal(await blank.evaluate(()=>GaPresentation.isCurrent()),false,'A new diagnosis asks for sustainable contribution in the calculator');
    await blank.locator('#pmt').fill('3000');await wait(350);
    assert.equal(await blank.evaluate(()=>GaPresentation.isCurrent()),true);
    await blank.close();
    const identified=await make();await load(identified,origin);
    await identified.evaluate(()=>{
      window.__testSaved=[];
      window.GarbaAccess={call:async(action,payload)=>{if(action==='advisory_save')window.__testSaved.push(payload);return {revision:window.__testSaved.length}}};
      window.garbaIdentified=true;
      window.__gaKnown={nom:'Cliente de prueba',edad:32,edadR:65,des:25000,ahorro:3000,reg:'NOM',dolor:['Retiro'],meta:['Seguridad'],porque:['Familia'],condicion:['Flexibilidad'],freno:['Tiempo']};
      window.__gaAdvisoryBoot={revision:0};GaV2.boot();
    });
    await openCalc(identified);await wait(1100);
    assert(await identified.evaluate(()=>GaV2._state.escenarios.length>0),'Identified session records the completed projection');
    await identified.locator('#pmt').fill('6000');await wait(1400);
    assert.equal(await identified.evaluate(()=>GaV2._state.escenarios.at(-1).in.pmt),6000,'History records live input');
    const historyCount=await identified.evaluate(()=>GaV2._state.escenarios.length);
    await identified.locator('#pmt').fill('');await wait(1100);
    assert.equal(await identified.evaluate(()=>GaV2._state.escenarios.length),historyCount,'Incomplete live input does not add a stale scenario');
    assert(await identified.evaluate(()=>window.__testSaved.length>0),'Identified saving reaches the mocked service');
    await identified.evaluate(()=>document.querySelector('#gaV2Known button.ga-v2-link').click());
    assert(await identified.evaluate(()=>GaShell.scenes.find(s=>s.dataset.scene==='6').dataset.skip==='1'),'Deepening a known diagnosis still keeps reality in the calculator');
    await identified.close();

    // Three-act flow: synthetic client only. Run alongside the existing classic regression suite.
    const modern=await make();
    await load(modern,origin,false);
    assert.equal(await modern.evaluate(()=>window.GA_FLOW_CLASSIC),false);
    assert.equal(await modern.evaluate(()=>GaShell.scenes.find(s=>s.dataset.scene==='1').dataset.skip),'1');
    await modern.evaluate(()=>{
      for(const [id,value] of Object.entries({gaName:'Prospecto de prueba',gaAge:'32',gaRetireAge:'65',gaGoal:'25000',gaPmt:'3000',gaTax:'93',gaWhy:'Construir retiro',gaMeaning:'Familia',gaConcern:'Flexibilidad'}))document.getElementById(id).value=value;
      GaShell.setConfirmed(true);GaShell.diagnosisChecks.ready='No';
      GaShell.show(GaShell.scenes.findIndex(s=>s.dataset.scene==='7'));
    });
    await modern.screenshot({path:path.join(output,'three-acts-diagnosis.png')});
    await modern.locator('#gaNext').click();
    await modern.locator('#resultsView.active').waitFor({timeout:6000});
    await wait(400);
    assert.equal(await modern.locator('#pmt').inputValue(),'3000');
    // Auditoría 2026-10-29: meta/brecha y detalle se quedan en sus pestañas (antes quedaban vacías).
    assert.equal(await modern.locator('#gaActGoal').count(),0);assert.equal(await modern.locator('#gaActTechnical').count(),0);
    assert(await modern.locator('#gaPane-gap #gaProjectionGap').count()===1,'La brecha sigue en su pestaña');
    assert(await modern.locator('#gaPane-detail .plan-hero').count()===1,'El resumen original pasa a Detalle, sin duplicar la cifra en Tu proyección');
    assert.equal(await modern.evaluate(()=>[...document.querySelectorAll('#gaAdvisorPanelButton,#gaActLibraryButton')].filter(b=>getComputedStyle(b).position==='fixed').length),0,'Sin botones flotantes sobre la pestaña compartida');
    assert(await modern.locator('#gaActOptionCards .ga-act-option').count()>=1);
    assert.equal(await modern.locator('#gaActFuture').innerText(),await modern.locator('#fondo65').innerText());
    // Elegir una opción más alta no borra lo que el prospecto dijo poder pagar.
    // Ronda 3: las opciones de arranque viven en la pestaña de la meta y la brecha.
    assert.equal(await modern.locator('#gaPane-gap #gaActOptions').count(),1,'Opciones de arranque en Tu meta y la brecha');
    await modern.locator('#gaTab-gap').click();await wait(200);
    const optionCount=await modern.locator('#gaActOptionCards .ga-act-option').count();
    await modern.locator('#gaActOptionCards .ga-act-option button').nth(optionCount-1).click();await wait(400);
    assert.equal(await modern.locator('#gaActOptionCards .ga-act-option').count(),optionCount,'Las opciones siguen disponibles después de elegir');
    assert((await modern.locator('#gaActOptionCards .ga-act-option strong').first().innerText()).startsWith('$3,000'),'La primera opción sigue siendo la capacidad del diagnóstico');
    await modern.locator('#gaActOptionCards .ga-act-option button').first().click();await wait(400);
    assert.equal(await modern.locator('#gaWaitResult').count(),0);
    assert(!(await modern.locator('body').innerText()).toLowerCase().includes('costo de esperar'));
    const pathData=await modern.evaluate(()=>({capital:Number(document.querySelector('#gaPathsvg').dataset.capital),end:Number(document.querySelector('#gaPathsvg').dataset.waveEnd),expected:reportState.fondo65,max:chart.options.scales.y.max,datasets:chart.data.datasets.length}));
    // Ronda 3: la gráfica original (con la línea de la meta) vive en Tu meta y la brecha con su escala original; Tu camino se escala al capital.
    assert.equal(pathData.capital,pathData.expected);assert.equal(pathData.end,pathData.expected);
    await round3Checks(modern,setCase,output);
    assert(!(await modern.evaluate(()=>GaThreeActs.summary())).includes('¿Cuándo te busco?'));
    // Matched screenshots from the mandatory 415b4d4 checkout, never from main.
    if(process.env.ADVISOR_ROUND2_BEFORE){
      const before=await make();await load(before,origin+'/round2-before/',false);await openCalc(before);
      const matching=await modern.evaluate(()=>Object.fromEntries(['nombreOpt','edad','years','metaHoy','pmt','lumpSum','regimenFiscal','ingresoMensualCliente','isrPct','reinvertISR','rate','inflation'].map(id=>{const e=document.getElementById(id);return [id,e.type==='checkbox'?e.checked:e.value]})));await setCase(before,matching);{const norm=v=>{const c=JSON.parse(JSON.stringify(v));if(c.report){for(const k of ['isrPct','ingreso65','ingreso60','devolucionFiscalPrimerAnoVista'])delete c.report[k]}return c};/* Ronda 3: ingreso65/ingreso60/devolucionFiscalPrimerAnoVista son guardados nuevos de solo lectura (antes no existían en reportState); *//* isrPct se deriva del listener de ingreso y no participa en Art. 93; la paridad financiera completa vs main se prueba en los 7 escenarios */assert.deepEqual(norm(await values(before)),norm(await values(modern)),'Before and after captures use the identical financial fixture');}
      await modern.evaluate(()=>scrollTo(0,0));await before.evaluate(()=>scrollTo(0,0));
      await before.screenshot({path:path.join(output,'round2-before-projection.png')});
      await modern.screenshot({path:path.join(output,'round2-after-projection.png')});
      await before.locator('#gaThreeMobileToggle').click();await before.screenshot({path:path.join(output,'round2-before-mobile.png')});await scaledCapture(before,'round2-before-mobile-shared-390.png');
      await before.locator('#gaMobileExit').click();
      for(const p of [before,modern]){await p.locator('[data-postcalc="decision"][data-value="think"]').click();await p.locator('#gaThinkReason').selectOption({label:'Platicarlo con mi pareja'});await p.locator('#gaThinkDate').fill('2026-11-05');await p.locator('#gaThinkTime').fill('18:00');}
      await before.screenshot({path:path.join(output,'round2-before-followup.png')});await modern.screenshot({path:path.join(output,'round2-after-followup.png')});
      for(const [p,name] of [[before,'before'],[modern,'after']]){await p.locator('#gaOpenResources').evaluate(el=>el.click());await p.screenshot({path:path.join(output,'round2-'+name+'-library.png')});await p.locator('#gaResourcesClose').click();}
      for(const [p,name] of [[before,'before'],[modern,'after']]){
        await p.locator('#gaTab-gap').click();await p.screenshot({path:path.join(output,'round2-'+name+'-gap.png')});await p.locator('#gaTab-projection').click();
        const popup=p.waitForEvent('popup');await p.locator('#gaAdvisorPanelButton').evaluate(el=>el.click());const privatePage=await popup;await privatePage.waitForLoadState();await privatePage.screenshot({path:path.join(output,'round2-'+name+'-panel.png')});await privatePage.close();
      }
      await before.close();await modern.evaluate(()=>{for(const id of ['gaThinkDate','gaThinkTime']){const el=document.getElementById(id);el.value='';el.dispatchEvent(new Event('change'))}document.getElementById('gaThinkPanel').hidden=true;});
    }
    await modern.screenshot({path:path.join(output,'three-acts-desktop.png'),fullPage:true});
    await modern.locator('#gaThreeMobileToggle').click();
    assert(await modern.evaluate(()=>document.body.classList.contains('ga-three-mobile')));
    await modern.locator('#gaMobileNext').click();assert(await modern.locator('#gaMobilePath').isVisible());assert.equal(await modern.locator('#gaMobilePath section').count(),4);
    await modern.screenshot({path:path.join(output,'three-acts-projected-mobile.png'),fullPage:true});
    await scaledCapture(modern,'round2-after-mobile-shared-390.png');
    await modern.locator('#gaMobileExit').click();
    await modern.locator('[data-postcalc="decision"][data-value="think"]').click();
    await modern.locator('#gaThinkReason').selectOption({label:'Platicarlo con mi pareja'});
    await modern.locator('#gaPostCalcContinue').click();
    assert.equal(await modern.locator('#gaPreopenView').isVisible(),false,'Think cannot continue without an agreed date');
    await modern.locator('#gaThinkDate').fill('2026-11-05');
    await modern.locator('#gaThinkTime').fill('18:00');
    await modern.locator('#gaThinkReady').fill('lo platicaste con tu pareja');
    await modern.locator('#gaThinkConfirm').click();
    assert.equal(await modern.evaluate(()=>GaThreeActs.state.date),'2026-11-05');
    assert.equal(await modern.evaluate(()=>JSON.parse(sessionStorage.getItem('garbaThreeAct')).ready),'lo platicaste con tu pareja');
    assert((await modern.evaluate(()=>GaThreeActs.summary())).includes('Para entonces ya… lo platicaste con tu pareja'));
    assert((await modern.evaluate(()=>GaThreeActs.summary())).includes('05/11/2026 18:00'),'Fecha del resumen en formato de México');
    await modern.screenshot({path:path.join(output,'three-acts-think-partner.png'),fullPage:true});
    await modern.locator('#gaPostCalcContinue').click();
    assert(await modern.locator('#gaPreopenView').isVisible());
    assert.equal(await modern.locator('#preOpeningParticipants').inputValue(),'Prospecto y pareja');
    await modern.screenshot({path:path.join(output,'three-acts-second-appointment.png'),fullPage:true});


    // Every objection must retain its own next step and preserve an explicit scheduling decision.
    const allReasons=['El monto','Platicarlo con mi pareja','Compararlo con otra opción','No sé si tendré liquidez','Quiero empezar más adelante','Quiero estar seguro de con quién lo hago','Otra'];
    const reasonCase=await make();await load(reasonCase,origin,false);await openCalc(reasonCase);
    for(const [n,choice] of allReasons.entries()){
      await reasonCase.evaluate(choice=>{
        document.getElementById('gaResourcesPanel').classList.remove('show');
        document.getElementById('gaCredentialsModal').classList.remove('open');
        document.querySelector('[data-postcalc="decision"][data-value="think"]').click();
        const el=document.getElementById('gaThinkReason');el.value=choice;el.dispatchEvent(new Event('change',{bubbles:true}));
        if(choice==='Otra'){const other=document.getElementById('gaThinkOther');other.value='Necesito revisar una condición';other.dispatchEvent(new Event('input',{bubbles:true}))}
      },choice);
      assert.equal(await reasonCase.evaluate(()=>GaThreeActs.state.reason),choice);
      assert((await reasonCase.locator('#gaThinkNext').innerText()).length>10,'A reason must produce an explicit next step');
      if(choice==='El monto')assert(await reasonCase.locator('#gaActOptions').count()===1);
      if(choice==='Quiero empezar más adelante')assert(!(await reasonCase.locator('body').innerText()).toLowerCase().includes('costo de esperar'));
      if(choice==='No sé si tendré liquidez')assert(await reasonCase.locator('#gaResourcesPanel').evaluate(el=>el.classList.contains('show')));
      if(choice==='Quiero estar seguro de con quién lo hago')assert(await reasonCase.locator('#gaCredentialsModal').evaluate(el=>el.classList.contains('open')));
      await reasonCase.evaluate(()=>{
        const date=document.getElementById('gaThinkDate');date.value='2026-11-05';date.dispatchEvent(new Event('change',{bubbles:true}));
        const time=document.getElementById('gaThinkTime');time.value='18:00';time.dispatchEvent(new Event('change',{bubbles:true}));
        document.getElementById('gaThinkConfirm').click();
      });
      assert.equal(await reasonCase.locator('#gaThinkError').innerText(),'Siguiente paso guardado en esta sesión.');
      assert((await reasonCase.evaluate(()=>GaThreeActs.summary())).includes('05/11/2026 18:00'));
      if(n===0||n===6)await reasonCase.screenshot({path:path.join(output,'think-reason-'+n+'.png'),fullPage:true});
    }
    await reasonCase.evaluate(()=>{
      const el=document.getElementById('gaThinkNoDate');el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));
      document.getElementById('gaThinkDate').value='';document.getElementById('gaThinkTime').value='';
      document.getElementById('gaThinkConfirm').click();
    });
    assert((await reasonCase.evaluate(()=>GaThreeActs.summary())).includes('Sin fecha acordada'));
    await reasonCase.close();

    // Actual jsPDF production path: download PDF and inspect the text calls used to build it.
    const pdfCase=await make();await load(pdfCase,origin,false);await openCalc(pdfCase);
    await pdfCase.evaluate(()=>{
      const state=GaThreeActs.state;state.ready='lo platicaste con tu pareja';state.reason='Platicarlo con mi pareja';state.date='2026-11-05';state.time='18:00';state.noDate=false;state.nextStep='Agendemos una segunda cita con ambos.';
      document.getElementById('gaLaterView').style.display='block';
      window.__pdfTexts=[];
      const OriginalPdf=window.jspdf.jsPDF;
      function AuditedPdf(...args){
        const doc=new OriginalPdf(...args);
        const oldText=doc.text.bind(doc);
        doc.text=function(...parts){window.__pdfTexts.push(String(parts[0]));return oldText(...parts)};
        return doc;
      }
      AuditedPdf.API=OriginalPdf.API;
      window.jspdf.jsPDF=AuditedPdf;
    });
    const pdfDownload=pdfCase.waitForEvent('download');
    await pdfCase.locator('#gaLaterPdf').click();
    const pdfFile=await pdfDownload;
    const pdfPath=path.join(output,'garba-segunda-cita-validacion.pdf');
    await pdfFile.saveAs(pdfPath);
    assert(fs.statSync(pdfPath).size>1000,'Real second-meeting PDF was generated');
    assert.equal(fs.readFileSync(pdfPath).subarray(0,4).toString(),'%PDF','Downloaded document has PDF header');
    const texts=await pdfCase.evaluate(()=>window.__pdfTexts.join(' | '));
    assert(texts.includes('2026-11-05')&&texts.includes('18:00'),'PDF includes proposed appointment date and time');
    assert(texts.includes('Platicarlo con mi pareja'),'PDF includes the decision reason');
    assert(texts.includes('Para entonces ya')&&texts.includes('lo platicaste con tu pareja')&&texts.includes('Cuándo te busco'),'PDF includes both follow-up fields');
    await pdfCase.close();
    const switched=await make();await load(switched,origin,false);
    await switched.evaluate(()=>document.getElementById('gaName').value='Prospecto ficticio');
    const popupPromise=switched.waitForEvent('popup');
    await switched.locator('#gaAdvisorPanelButton').click();
    const advisorPopup=await popupPromise;await advisorPopup.waitForLoadState();
    assert(await advisorPopup.locator('#clock').isVisible());
    assert.equal(await switched.locator('#clock').count(),0,'Advisor-only clock must never be in shared tab');
    assert.equal(await switched.locator('#suggestion').count(),0,'Advisor coaching must never be in shared tab');
    await advisorPopup.clock.install({time:new Date('2026-10-30T12:00:00')});await advisorPopup.reload();await advisorPopup.waitForLoadState('domcontentloaded');
    for(const [act,label] of [[1,'Pasa a su número'],[2,'Pregunta: ¿cuándo te gustaría aperturarlo?']]){
      await advisorPopup.evaluate(act=>{localStorage.setItem('gaAdvisorPanelSignal',JSON.stringify({type:'state',at:Date.now(),data:{act,elapsed:{1:0,2:0,3:0}}}));dispatchEvent(new StorageEvent('storage',{key:'gaAdvisorPanelSignal',newValue:localStorage.getItem('gaAdvisorPanelSignal')}))},act);
      await advisorPopup.clock.runFor(719000);assert.equal(await advisorPopup.locator('#signal').innerText(),'');await advisorPopup.clock.runFor(2000);assert.equal(await advisorPopup.locator('#signal').innerText(),label);
    }
    await advisorPopup.locator('#asked').click();assert(await advisorPopup.locator('#closing').isVisible());assert(await advisorPopup.locator('#opening').isVisible());
    assert.equal(await switched.locator('#asked,#closing,#opening').count(),0);
    await advisorPopup.screenshot({path:path.join(output,'advisor-private-panel.png')});
    await advisorPopup.locator('#toggle').click();await wait(300);
    assert.equal(await switched.evaluate(()=>window.GA_FLOW_CLASSIC),true);
    assert.equal(await switched.evaluate(()=>GaShell.scenes.find(s=>s.dataset.scene==='1').dataset.skip),undefined);
    assert.equal(await switched.locator('#gaName').inputValue(),'Prospecto ficticio','Classic switch preserves session data');
    assert.equal(await switched.locator('#gaActHero').isVisible(),false);
    await advisorPopup.close();await switched.close();
    const profile=await make();await profile.setViewportSize({width:390,height:844});await load(profile,origin+'/asesor/',false);
    assert(await profile.locator('h1').innerText()==='Christian Iván García Barragán');
    assert(await profile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await profile.screenshot({path:path.join(output,'advisor-profile-390.png')});
    await profile.close();await modern.close();
    assert.deepEqual(errors,[],'No browser runtime errors');
    console.log('PASS: full-width advisory, full-screen resources, keyboard return, live input/results/chart, stale-output protection, fixed controls, result tabs, responsive layouts.');
    console.log('Screenshots:',output);
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1;server.close()});
