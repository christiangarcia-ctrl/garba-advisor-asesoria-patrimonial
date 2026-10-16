const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const base=process.env.GARBA_AUDIT_ROOT;assert(base,'Set GARBA_AUDIT_ROOT to the parent of the garba-advisor checkout');const out=process.env.GARBA_AUDIT_OUTPUT||path.join(require('os').tmpdir(),'garba-mobile-pdf');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{let file=path.join(base,decodeURIComponent(req.url.split('?')[0]));if(file.endsWith('/'))file+='index.html';try{res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});let report={checks:[],errors:[],overflow:[]};try{
 const context=await browser.newContext();await context.route('https://**/*',r=>r.abort());const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));const origin='http://127.0.0.1:'+server.address().port;
 const shot=async(name)=>{await p.screenshot({path:path.join(out,name+'.png'),fullPage:true})};
 const checkWidth=async(label)=>{const x=await p.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));if(x.s>x.w+1)report.overflow.push({label,...x})};
 await p.goto(origin+'/garba-advisor/');await p.setViewportSize({width:1440,height:900});
 await p.evaluate(()=>{for(const [id,v] of Object.entries({gaName:'Cliente de prueba',gaAge:'32',gaRetireAge:'65',gaGoal:'25000',gaPmt:'3000',gaTax:'93'}))document.getElementById(id).value=v;});
 await p.evaluate(()=>GaShell.openProposal());await p.locator('#resultsView.active').waitFor();await p.waitForTimeout(500);await p.waitForTimeout(1200);await p.evaluate(()=>{for(const [id,v] of Object.entries({nombreOpt:'Cliente de prueba',edad:32,years:15,metaHoy:25000,pmt:3000,lumpSum:0,regimenFiscal:'93',rate:8.8,inflation:4}))document.getElementById(id).value=v;GaPresentation.refresh({force:true})});await p.waitForFunction(()=>GaPresentation.isCurrent());
 await p.locator('#gaTab-detail').click();const projectionDownload=p.waitForEvent('download');await p.evaluate(()=>document.getElementById('printBtn').click());await (await projectionDownload).saveAs(path.join(out,'projection.pdf'));
 const expected=await p.evaluate(()=>['rptFondoFinAport','rptFondo60e','rptFondo65Moment','rptTotalAportado','rptRendimiento','rptMultiplicador','rptAportMensual','rptPlazo','rptHoyMonto','rpt1Monto','rpt3Monto','rpt5Monto','rpt1Delta','rpt3Delta','rpt5Delta','rptCompMattress','rptCompBank','rptCompAfore','rptCompPlan','rptRendimientoUsado','rptInflacionUsada','rptStrategyGoal','rptStrategyPriority'].map(id=>({id,value:document.getElementById(id).textContent.trim()})));fs.writeFileSync(path.join(out,'expected-financial-values.json'),JSON.stringify(expected,null,2));
 const format=await p.evaluate(()=>{const d=GaMobilePDF.projection();return {width:d.internal.pageSize.getWidth(),height:d.internal.pageSize.getHeight(),pages:d.getNumberOfPages()}});assert.equal(format.width,360);assert.equal(format.height,640);assert.equal(format.pages,6);report.checks.push({projection:format});
 await p.emulateMedia({media:'screen'});
 await p.evaluate(()=>{document.getElementById('legacyApp').style.display='none';document.getElementById('gaShell').style.display='';document.getElementById('gaResourcesPanel').classList.add('show')});
 await p.evaluate(()=>{document.getElementById('gaResourcesPanel').classList.remove('show');document.getElementById('gaName').value='Cliente de prueba';GaShell.openPreopen()});
 await p.evaluate(()=>document.getElementById('gaPreContinue').click());
 for(const width of [390,844,1440]){await p.setViewportSize({width,height:900});await shot('strategy-'+width);await checkWidth('strategy-'+width)}
 await p.locator('#stratOtherOption').click();
 const downloadPromise=p.waitForEvent('download');await p.locator('#stratPdf').click();const download=await downloadPromise;await download.saveAs(path.join(out,'strategy.pdf'));
 const packageDownloadPromise=p.waitForEvent('download',{timeout:60000});await p.locator('#stratPackageDownload').click();const packageDownload=await packageDownloadPromise;await packageDownload.saveAs(path.join(out,'client-records.zip'));
 report.checks.push('Records: actual ZIP package download');
 report.checks.push('Strategy: alternate allocation and actual PDF download');
 await p.locator('#stratContinue').click();for(const width of [390,1440]){await p.setViewportSize({width,height:900});await shot('referrals-'+width);await checkWidth('referrals-'+width)}
 report.checks.push('Mobile PDF downloads and ZIP package');
 assert.deepEqual(report.overflow,[]);assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync(path.join(out,'package-audit.json'),JSON.stringify(report,null,2));await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
