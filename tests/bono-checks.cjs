/* Bono de Fidelidad: tabla del folleto y mecánica de acreditación (sin navegador). */
const assert=require('node:assert/strict'),path=require('node:path');
const {pct,calc}=require(path.join(__dirname,'..','bono.js'));
// tabla (folleto OptiMaxx plus 2025 / CG 3.6)
const T=[[10,36000,.15],[12,60000,.25],[14,90000,.35],[15,24000,.30],[17,36000,.40],[19,60000,.50],[19,90000,.60],[20,24000,.55],[20,36000,.65],[25,60000,.75],[25,90000,1]];
for(const [y,a,p] of T)assert.equal(pct(y,a),p,y+' años / $'+a);
assert.equal(pct(9,120000),0,'menos de 10 años: sin bono');
assert.equal(pct(10,24000),0,'10-14 años con menos de $36,000: NA, conservador');
assert.equal(pct(20,23999),0,'bajo la aportación mínima: sin bono');
// caso Misael: $3,500 al mes, 20 años, 40 años de edad
const m=calc({pmt:3500,years:20,edad:40,rAcc:10,infl:4});
assert.equal(m.pct,.65);assert.equal(Math.round(m.annual),42000);assert.equal(Math.round(m.inicial),27300);
assert.equal(m.creditMonth,240);
assert(m.acreditado>m.inicial,'el bono rinde antes de acreditarse');
assert(m.a65>m.acreditado,'crece en el fondo hasta los 65');
// tope de 9 %: con inflación alta no pasa de 9
assert.equal(calc({pmt:3500,years:20,edad:40,rAcc:10,infl:8}).rb,.09);
// plazo que termina después de los 65: se acredita a los 65
const l=calc({pmt:3500,years:25,edad:50,rAcc:10,infl:4});assert.equal(l.creditMonth,180);assert.equal(Math.round(l.a65),Math.round(l.acreditado));
assert.equal(calc({pmt:0,years:20,edad:40}),null);
console.log('PASS: tabla de porcentajes, caso Misael ($27,300 = 65 % de $42,000), rendimiento con tope 9 %, acreditación al terminar el plazo.');
