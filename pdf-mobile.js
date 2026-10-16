/* Editorial PDF layout. Values are read from the existing calculator and report. */
(()=>{
 'use strict';
 const C={navy:'#132A40',ink:'#1D3348',gold:'#A37E48',muted:'#607082',paper:'#F5F3EE',line:'#DFE3E5',white:'#FFFFFF'};
 const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[−–—]/g,'-').replace(/→|↗/g,'>').replace(/\s+/g,' ').trim();
 const text=el=>el?clean([...el.childNodes].map(n=>n.nodeType===3?n.textContent:n.nodeType===1?text(n):'').join(' ')):'';
 const get=id=>text(document.getElementById(id));
 const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n||0);
 function layout(title){
  const doc=new window.jspdf.jsPDF({orientation:'portrait',unit:'pt',format:[360,640],compress:true});
  window.GaPdfFonts(doc);
  doc.setProperties({title,author:'Christian GarBa',subject:'Resumen patrimonial para celular'});
  let page=0,y=0;
  const font=(size,bold=false,color=C.ink)=>{doc.setFont('Garba',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(color)};
  const lines=(s,size=15,width=312,bold=false)=>{font(size,bold);return doc.splitTextToSize(clean(s),width)};
  function write(s,x,top,{size=15,bold=false,color=C.ink,width=312,leading=1.3}={}){
   const rows=lines(s,size,width,bold);font(size,bold,color);doc.text(rows,x,top+size*.83,{lineHeightFactor:leading});return rows.length*size*leading;
  }
  function newPage(kicker,title){
   if(page)doc.addPage([360,640]);page++;
   doc.setFillColor(C.paper);doc.rect(0,0,360,640,'F');
   font(12,true,C.navy);doc.text('Christian GarBa',24,31);font(10,false,C.muted);doc.text('CONSULTORÍA PATRIMONIAL',24,46);
   doc.setFillColor(C.gold);doc.rect(310,25,26,3,'F');
   y=62;write(kicker.toUpperCase(),24,y,{size:11,bold:true,color:C.gold});y+=20;
   y+=write(title,24,y,{size:24,bold:true,leading:1.12})+14;
  }
  function ensure(h){if(y+h>596)newPage('Continuación',title);}
  function para(s,{size=15,color=C.muted,gap=8}={}){if(!clean(s))return;const h=lines(s,size).length*size*1.3;ensure(h);write(s,24,y,{size,color});y+=h+gap;}
  function box(label,value,note='',{dark=false,compact=false}={}){
   const valueSize=compact?26:clean(value).length>19?22:32;
   const pad=compact?12:18,noteSize=compact?12:14;const h=pad+lines(label,12,276,true).length*15.6+8+lines(value,valueSize,276,true).length*valueSize*1.15+(note?8+lines(note,noteSize,276).length*noteSize*1.3:0)+pad;
   ensure(h);doc.setFillColor(dark?C.navy:C.white);doc.roundedRect(24,y,312,h,10,10,'F');
   let top=y+pad;top+=write(label,42,top,{size:12,bold:true,color:dark?'#D0B48B':C.muted,width:276})+8;
   top+=write(value,42,top,{size:valueSize,bold:true,color:dark?C.white:C.navy,width:276,leading:1.15});
   if(note)write(note,42,top+8,{size:noteSize,color:dark?'#D5DFE7':C.muted,width:276});
   y+=h+12;
  }
  function pair(items){
   const h=70;ensure(h);items.forEach((item,i)=>{const x=24+i*162;doc.setFillColor(C.white);doc.roundedRect(x,y,150,h,8,8,'F');write(item[0],x+12,y+12,{size:11,bold:true,color:C.muted,width:126});write(item[1],x+12,y+39,{size:18,bold:true,width:126});});y+=h+12;
  }
  function row(label,value,note=''){
   const h=Math.max(lines(label,14,176,true).length*18.2,lines(value,19,124,true).length*24.7)+(note?lines(note,12).length*15.6+6:0)+14;
   ensure(h);write(label,24,y,{size:14,bold:true,width:176});write(value,210,y,{size:19,bold:true,width:126,color:C.navy});
   let top=y+Math.max(lines(label,14,176,true).length*18.2,lines(value,19,124,true).length*24.7)+6;
   if(note)write(note,24,top,{size:12,color:C.muted});doc.setDrawColor(C.line);doc.line(24,y+h-10,336,y+h-10);y+=h;
  }
  function smallTitle(s){ensure(36);y+=3;y+=write(s,24,y,{size:16,bold:true})+8;}
  function finish(){
   const count=doc.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);doc.setDrawColor(C.line);doc.line(24,609,336,609);font(10,false,C.muted);doc.text('ESCENARIO ILUSTRATIVO · GARBA',24,627);doc.text(`${String(i).padStart(2,'0')} / ${String(count).padStart(2,'0')}`,336,627,{align:'right'});}return doc;
  }
  return {doc,newPage,para,box,pair,row,smallTitle,finish,write,get y(){return y},set y(value){y=value}};
 }
 function projection(){
  if(window.GaPresentation&&!GaPresentation.isCurrent())throw new Error('Completa la proyección antes de descargar el PDF.');
  actualizarReporteBase();const s=reportState,w=layout('Tu estrategia de retiro · Christian GarBa');
  w.newPage('01 · Tu punto de partida','Tu retiro,\ncon dirección.');
  w.para(get('rptClientName2'),{size:17,color:C.navy,gap:6});w.para(get('rptHeroMeta'),{size:13,gap:16});
  w.box('CAPITAL PROYECTADO A LOS 65',money(s.fondo65),'Valor futuro estimado, bajo los supuestos de tu escenario.',{dark:true});
  const ingreso=s.regimenFiscal==='93'?get('rptIngreso65'):get('rptIngreso65Single');
  w.box('INGRESO MENSUAL DESDE LOS 65',ingreso,'Referencia durante 20 años. No es un ingreso garantizado.',{compact:true});
  w.pair([['TOTAL APORTADO',get('rptTotalAportado')],['RENDIMIENTO',get('rptRendimiento')]]);
  w.para(get('rptFecha')+' · '+get('rptHeroBadge'),{size:12,gap:0});

  w.newPage('02 · El recorrido','Tres momentos\nde tu patrimonio.');
  const stageIDs=[['rptEtapa1Label','rptFondoFinAport','rptEdadFinAport'],['rptEtapa2Label','rptFondo60e','rptEdad60'],['rptEtapa3Label','rptFondo65Moment','rptEdad65']];
  stageIDs.forEach(([label,value,note])=>w.box(get(label),get(value),get(note),{compact:true}));
  if(s.regimenFiscal==='93')w.para('Desde los 60 años: '+get('rptIngreso60')+'/mes durante 20 años, sobre un capital base de '+get('rptCapBase60')+'.',{size:13,gap:0});
  else w.para('Capital base a los 65: '+get('rptCapBase65Single')+'. Referencia ilustrativa durante 20 años.',{size:13,gap:0});

  w.newPage('03 · Perspectiva','Lo que construye\ntu constancia.');
  w.para('Comparativo al finalizar las aportaciones. '+get('rptCompPlanAge')+'.',{size:14});
  w.row('Guardar en casa',get('rptCompMattress'),get('rptCompMattressReal'));
  w.row('Cuenta bancaria',get('rptCompBank'),get('rptCompBankReal'));
  w.row('AFORE conservador',get('rptCompAfore'),'Referencia: 3.47% anual.');
  w.row('Tu plan proyectado',get('rptCompPlan'));
  w.para('Multiplicador estimado: '+get('rptMultiplicador')+'. '+get('rptCompMessage'),{size:13,gap:0});

  w.newPage('04 · Las decisiones','El tiempo también\nes una aportación.');
  w.para('Aportación mensual estimada para buscar el mismo escenario a los 65.',{size:14});
  w.row('Comenzando hoy',get('rptHoyMonto'));
  w.row('En 1 año',get('rpt1Monto'),get('rpt1Delta'));
  w.row('En 3 años',get('rpt3Monto'),get('rpt3Delta'));
  w.row('En 5 años',get('rpt5Monto'),get('rpt5Delta'));
  w.smallTitle('Supuestos y ruta fiscal');
  w.para(get('rptRendimientoUsado')+' nominal · inflación '+get('rptInflacionUsada')+' · '+get('rptPlazo')+' de aportaciones. '+get('rptRegimen')+'.',{size:13,gap:8});
  if(s.regimenFiscal==='151'&&s.impactoISR65>0)w.para('ISR reinvertido: impacto a los 65 '+get('rptISRImpacto65')+'; crecimiento atribuible '+get('rptISRCrecimiento')+'. Reinversión anual durante las aportaciones, no al final.',{size:13,gap:8});
  w.para('Los beneficios fiscales dependen de la modalidad, edad, permanencia y requisitos aplicables. Requieren revisión de tu situación particular.',{size:13,gap:0});

  w.newPage('05 · Tu estrategia','Una estrategia\ncon propósito.');
  w.smallTitle('Lo que quieres resolver');w.para(get('rptStrategyGoal'),{size:15,gap:8});
  w.smallTitle('Tu prioridad');w.para(get('rptStrategyPriority'),{size:15,gap:8});
  w.smallTitle('Tu condición indispensable');w.para(get('rptStrategyConcern'),{size:14,gap:10});
  w.para(get('rptStrategyReading'),{size:14,gap:12});
  w.smallTitle('El siguiente paso');
  w.para('1. Validar que la aportación sea sostenible.\n2. Revisar la estructura fiscal y el riesgo.\n3. '+get('rptStrategyNext'),{size:14,gap:0});

  w.newPage('06 · Acompañamiento','Una decisión informada,\na tu ritmo.');
  w.smallTitle('Tu asesor');w.para('Christian Iván García Barragán',{size:15,color:C.navy,gap:6});
  w.para('CNSF G384982 · Vigencia: 03/03/2025 al 03/03/2028. Distribuidor Allianz.',{size:12});
  const qr=document.querySelector('.pdf-qr-img');
  if(qr?.complete&&qr.naturalWidth){try{w.doc.addImage(qr.src,'JPEG',24,w.y,76,76);w.write('Valida mi cédula ante la CNSF.',116,w.y+8,{size:14,width:220});w.write('WhatsApp\n662 307 2573',116,w.y+40,{size:16,bold:true,width:220});w.y+=90;}catch{w.para('WhatsApp · 662 307 2573',{size:18});}}
  w.smallTitle('Información importante');w.para(text(document.querySelector('.pdf-disclaimer')),{size:12,gap:0});
  return w.finish();
 }
 function strategy(source){
  const w=layout('Tu estrategia de inversión · Christian GarBa');
  w.newPage('01 · Tu portafolio','Una combinación\ncon intención.');
  w.para(text(source.querySelector('.strat-pdf-header p')),{size:13});
  const blocks=[...source.querySelectorAll('.strat-pdf-block')];
  for(const p of blocks[0].querySelectorAll('p')){
   const title=text(p.querySelector('b')),detail=text(p).slice(title.length).replace(/^\s*-\s*/,'');
   w.smallTitle(title);w.para(detail,{size:15,gap:14});
  }
  w.newPage('02 · El criterio','Por qué esta\nestrategia para ti.');
  const reason=text(blocks[1].querySelector('p')).split(/\.\s+/)[0].replace(/\.$/,'')+'.';
  w.para(reason,{size:15,gap:12});
  w.smallTitle('Renta fija / renta variable');for(const p of blocks[2].querySelectorAll('p'))w.para(text(p),{size:14,gap:12});
  w.smallTitle('Antes de decidir');w.para(text(source.querySelector('.strat-pdf-foot')),{size:12,gap:0});
  return w.finish();
 }
 window.GaMobilePDF={projection,strategy,downloadProjection(){return projection().save('GarBa_Proyeccion_Celular.pdf')},projectionBlob(){return projection().output('blob')},downloadStrategy(source,name){return strategy(source).save(name)}};
})();
