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
  const isBaseline=url.pathname.startsWith('/baseline/');
  const name=decodeURIComponent(url.pathname.replace(isBaseline?'/baseline/':'/',''))||'index.html';
  const base=isBaseline?baseline:root;
  if(!base){res.writeHead(404).end();return;}
  const file=path.resolve(base,name);
  if(!file.startsWith(path.resolve(base)+path.sep)){res.writeHead(403).end();return;}
  const type={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
  try{res.writeHead(200,{'Content-Type':type});res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}
});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
  const errors=[];
  const make=async()=>{
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.dismiss());
    await page.route('https://**/*',route=>route.abort());
    return page;
  };
  const page=await make();
  const load=async(p,url)=>{await p.goto(url);await wait(250)};
  const openCalc=async(p)=>{
    await p.evaluate(()=>{
      for(const [id,value] of Object.entries({gaName:'Cliente de prueba',gaAge:'32',gaRetireAge:'65',gaGoal:'25000',gaPmt:'3000',gaTax:'93'}))document.getElementById(id).value=value;
      GaShell.proceedOpenProposal();
    });
    await p.locator('#resultsView.active').waitFor();await wait(200);
  };
  const values=async(p)=>p.evaluate(()=>({
    report:{...reportState},table:document.getElementById('tbody').innerText,retirement:document.getElementById('tbodyRet').innerText,
    results:['keyFondoPlan','fondo65','etapaFondo60','pmtReal','pmtDesde60','compPlan','taxFirstAmount','isrImpacto65'].map(id=>document.getElementById(id)?.textContent)
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
    await page.locator('#gaOpenResources').click();await wait(150);
    const panel=await page.locator('.ga-resources-panel-card').boundingBox();
    assert.deepEqual([Math.round(panel.width),Math.round(panel.height)],[1440,900]);
    await page.screenshot({path:path.join(output,'resources-desktop.png')});
    await page.locator('#gaAllSlides').click();
    const resourceBefore=await page.locator('#gaSlideImage').getAttribute('src');
    await page.keyboard.press('ArrowRight');await wait(100);
    assert.notEqual(await page.locator('#gaSlideImage').getAttribute('src'),resourceBefore);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#gaResourcesPanel').evaluate(el=>el.classList.contains('show')),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'gaOpenResources');
    await openCalc(page);
    assert(await page.locator('#captureView').isVisible());
    assert(await page.locator('#resultsView').isVisible());
    await page.screenshot({path:path.join(output,'calculator-desktop.png')});
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
    await page.locator('#editBtn').click();
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
    await page.setViewportSize({width:1366,height:768});
    await page.screenshot({path:path.join(output,'calculator-laptop.png')});
    for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
      await page.setViewportSize(viewport);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('#captureView').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'calculator-mobile.png')});
    assert(await page.locator('.ga-live-mobile-result').isVisible());
    await page.locator('#pmt').fill('4000');await wait(350);
    assert.equal(await page.locator('#gaMobileAmount').innerText(),await page.locator('#keyFondoPlan').innerText());
    await page.locator('#gaMobileResults').click();await wait(500);
    await page.screenshot({path:path.join(output,'results-mobile.png')});
    await page.locator('#gaExitToShell').click();await wait(1200);
    await page.evaluate(()=>GaShell.show(0));await wait(300);
    await page.screenshot({path:path.join(output,'intro-mobile.png')});
    await page.locator('#gaOpenResources').click();await wait(100);
    await page.screenshot({path:path.join(output,'resources-mobile.png')});
    await page.setViewportSize({width:844,height:390});await wait(500);
    await page.screenshot({path:path.join(output,'resources-mobile-landscape.png')});
    assert.equal(await page.locator('.ga-resources-panel-card').evaluate(el=>Math.round(el.getBoundingClientRect().height)),390);
    assert.deepEqual(errors,[],'No browser runtime errors');
    console.log('PASS: full-width advisory, full-screen resources, keyboard return, live input/results/chart, stale-output protection, mobile summary, responsive layouts.');
    console.log('Screenshots:',output);
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1;server.close()});
