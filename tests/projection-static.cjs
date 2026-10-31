/* Deterministic browser-free geometry and financial source checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'projection-path.js'),'utf8');
const curve=source.slice(source.indexOf('function curve('),source.indexOf('// ===== geometría'));
const context={TOTAL:396,END:300,document:{getElementById:()=>({value:'0'})},chart:{data:{datasets:[{data:Array.from({length:33},(_,i)=>(i+1)*100000)}]}}};
vm.createContext(context);vm.runInContext(curve+';this.result=curve({fondoPlan:2500000,fondo65:3300000});this.w=wave(result)',context);
assert.equal(context.result[300],2500000);assert.equal(context.result[396],3300000);assert.equal(context.w[0],0);assert.equal(context.w.at(-1),3300000);assert(context.w.every(v=>v>=0));
vm.runInContext('this.w2=wave(result)',context);assert.deepEqual(context.w,context.w2);
const current=fs.readFileSync(path.join(root,'index.html'),'utf8'),baseline=cp.execFileSync('git',['show','main:index.html'],{cwd:root,encoding:'utf8',maxBuffer:5e6});
const clean=s=>s.replace(/^  reportState.devolucionFiscalPrimerAnoVista=.*\n/gm,'').replace(/^  reportState.ingreso65=ingreso65;reportState.ingreso60=ingreso60;\n/gm,'');
for(const name of ['calcularPMTRequerido','updateSuggestion','calcAccum','pmtParaFondo65','calcRet','actualizarReporteBase']){
 const section=s=>{const start=s.indexOf('function '+name+'(');assert(start>=0,name);const tail=s.slice(start),end=tail.slice(1).search(/\nfunction /);return clean(end<0?tail:tail.slice(0,end+1))};
 assert.equal(section(current),section(baseline),name+' financial source unchanged');
}
console.log('PASS: annual endpoints, deterministic nonnegative wave, six financial functions unchanged except authorized reportState saves.');
// Private panel: execute its actual inline script with a simulated clock/channel.
{
 const html=fs.readFileSync(path.join(root,'advisor-panel.html'),'utf8');
 const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const elements=new Map();for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],{hidden:/^(closing|opening)$/.test(m[1])});
 let now=100000,interval,receive;const sent=[];
 class Channel{addEventListener(_,cb){receive=cb}postMessage(m){sent.push(m)}}
 class ClockDate extends Date{static now(){return now}}
 vm.runInNewContext(source,{document:{getElementById:id=>elements.get(id)},BroadcastChannel:Channel,Date:ClockDate,localStorage:{getItem:()=>null},addEventListener(){},setInterval:fn=>interval=fn});
 for(const [act,text] of [[1,'Pasa a su número'],[2,'Pregunta: ¿cuándo te gustaría aperturarlo?']]){
  receive({data:{type:'state',at:now,data:{act,elapsed:{1:0,2:0,3:0}}}});now+=719000;interval();assert.equal(elements.get('signal').textContent,'');now+=1000;interval();assert.equal(elements.get('signal').textContent,text);
 }
 elements.get('asked').onclick();assert.equal(elements.get('closing').hidden,false);assert.equal(elements.get('opening').hidden,false);elements.get('opening').onclick();assert.equal(sent.at(-1).type,'opening');
 console.log('PASS: actual private panel script at 11:59/12:00 for acts 1 and 2, closing signal and opening command (simulated clock/channel).');
}
