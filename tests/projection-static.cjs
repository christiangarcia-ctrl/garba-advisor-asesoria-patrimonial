/* Browser-free checks for display geometry. Does not replace the Playwright financial suite. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const cp=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const nodes=new Map();
class Element{
 constructor(){this.children=[];this.dataset={};this.attrs={};this.hidden=false;this.firstChild={};this.lastChild={};this.lastElementChild=this.lastChild;}
 set innerHTML(s){this.html=s;for(const m of s.matchAll(/id="([^"]+)"/g))nodes.set(m[1],new Element());}
 get innerHTML(){return this.html||'';}
 append(...els){this.children.push(...els)}
 before(){} after(){}
 replaceChildren(...els){this.children=els}
 setAttribute(k,v){this.attrs[k]=v}
 getAttribute(k){return this.attrs[k]}
 querySelectorAll(){return this.children}
}
for(const id of ['gaPane-projection','gaPane-gap','gaProjectionGraph','pmt'])nodes.set(id,new Element());nodes.get('pmt').value='3000';
const report={planYears:15,fondoPlan:900000,fondo65:2400000,ingresoMensual:18000};
const context={document:{getElementById:id=>nodes.get(id),createElement:()=>new Element(),createComment:()=>new Element(),addEventListener(){}},window:{},reportState:report,chart:{data:{datasets:[{data:[10000,25000,100000,500000,1200000,2400000]}]}},Number,Math,Date};
nodes.set('edad',{value:'32'});
vm.runInNewContext(fs.readFileSync(path.join(root,'projection-path.js'),'utf8'),context);
context.window.GaPath.render();
const svg=nodes.get('gaPathGraph').innerHTML;
assert(svg.includes('data-capital="2400000"'));assert(svg.includes('data-wave-end="2400000"'));
const paths=[...svg.matchAll(/<path d="([ML\d., -]+)" fill="none"/g)];assert.equal(paths.length,2);
for(const p of paths){assert(p[1].startsWith('M24.00,390.00'));assert(p[1].endsWith('L1170.00,130.00'));for(const pair of p[1].matchAll(/[ML]([\d.]+),(-?[\d.]+)/g))assert(Number(pair[2])<=390,'No negative illustrative balance');}
context.window.GaPath.render();assert.equal(nodes.get('gaPathGraph').innerHTML,svg,'Deterministic wave');
for(const age of [25,42]){const points=context.window.GaPath.milestones(age,15,new Date(2026,9,30));assert.equal(points.length,4);assert.equal(points[0].date,'10/2026');assert.equal(points[1].date,'04/2028');assert.equal(points[1].age,(age+1)+' años y 6 meses');assert.equal(points[2].date,'10/2041');assert.equal(points[3].date,age===25?'10/2066':'10/2049');assert.equal(points[3].age,'65 años');}
const buttons=nodes.get('gaFlexButtons').children;assert.equal(buttons.length,5);
for(const b of buttons){b.onclick();assert.equal(nodes.get('gaFlexDetail').hidden,false);assert.equal(b.getAttribute('aria-expanded'),'true');b.onclick();assert.equal(nodes.get('gaFlexDetail').hidden,true);}
const current=fs.readFileSync(path.join(root,'index.html'),'utf8');
const baseline=cp.execFileSync('git',['show','main:index.html'],{cwd:root,encoding:'utf8',maxBuffer:5e6});
for(const name of ['calcularPMTRequerido','updateSuggestion','calcAccum','pmtParaFondo65']){
 const section=s=>{const start=s.indexOf('function '+name+'(');assert(start>=0,name);const tail=s.slice(start);const end=tail.slice(1).search(/\nfunction /);return end<0?tail:tail.slice(0,end+1)};
 assert.equal(section(current),section(baseline),name+' unchanged versus main');
}
console.log('PASS: display scale/endpoints, deterministic nonnegative wave, 4 dated milestones for 2 ages, 5 inline toggles; 4 financial routines byte-identical to main. Financial browser scenarios pending.');
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
