/* Mobile-first PDF presentation. All values come from the existing report DOM. */
(()=>{
 'use strict';
 const WIDTH=360,HEIGHT=640,MARGIN=24,BOTTOM=600;
 const navy='#102640',blue='#315c8c',muted='#50657a';
 const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[−–—]/g,'-').replace(/→|↗/g,'>').replace(/\s+/g,' ').trim();
 const hidden=el=>el.hidden||el.style.display==='none';
 function text(el){
  if(!el||hidden(el))return '';
  return clean([...el.childNodes].map(n=>n.nodeType===3?n.textContent:n.nodeType===1?text(n):'').join(' '));
 }
 function writer(title){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'pt',format:[WIDTH,HEIGHT],compress:true});
  doc.setProperties({title,author:'Christian GarBa',subject:'Lectura en celular - una columna'});
  let y=64;
    function top(){doc.setFillColor(navy);doc.rect(0,0,WIDTH,42,'F');doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor('#ffffff');doc.text('Christian GarBa',MARGIN,26);}
  function next(){doc.addPage([WIDTH,HEIGHT]);y=64;top();}
  function space(h){if(y+h>BOTTOM)next();}
  function paragraph(value,{size=16,bold=false,color=navy,gap=12}={}){
   const s=clean(value);if(!s)return;
   doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);
   const lines=doc.splitTextToSize(s,WIDTH-2*MARGIN),lineHeight=size*1.32;
   space(Math.min(lines.length*lineHeight,BOTTOM-64));
   for(const line of lines){space(lineHeight);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(color);doc.text(line,MARGIN,y+size*.83);y+=lineHeight;}
   y+=gap;
  }
  function heading(value){doc.setFont('helvetica','bold');doc.setFontSize(22);const h=doc.splitTextToSize(clean(value),WIDTH-2*MARGIN).length*22*1.32+24;space(h+100);y+=8;paragraph(value,{size:22,bold:true,color:blue,gap:16});}
  function card(el){
   if(!el||hidden(el))return;
   const children=[...el.children].filter(c=>!hidden(c)&&text(c));
   if(!children.length){paragraph(text(el));return;}
   if(children.length===1&&children[0].matches('p')){paragraph(text(children[0]));return;}
   let height=10;for(const child of children){const amount=/^\$[\d,.]+(?:\s|$)|^\d+(?:\.\d+)?x$/.test(text(child));doc.setFont('helvetica','normal');doc.setFontSize(amount?26:16);height+=doc.splitTextToSize(text(child),WIDTH-2*MARGIN).length*(amount?26:16)*1.32+8;}space(Math.min(height,BOTTOM-64));
   children.forEach((child,i)=>{
    const value=text(child);const amount=/^\$[\d,.]+(?:\s|$)|^\d+(?:\.\d+)?x$/.test(value);
    paragraph(value,{size:amount?26:16,bold:amount||i===0,color:i===0?blue:navy,gap:8});
   });
   y+=10;
  }
  function image(el){
   if(!el?.complete||!el.naturalWidth||!el.src)return;
   const qr=el.alt.includes('QR'),w=qr?112:el.alt.includes('Allianz')?128:80,h=w*el.naturalHeight/el.naturalWidth;
   space(h+20);
   try{doc.addImage(el.src,el.src.startsWith('data:image/png')||el.src.endsWith('.png')?'PNG':'JPEG',MARGIN,y,w,h);y+=h+16;}catch{/* The matching textual accreditation remains in the document. */}
  }
  function finish(){
   const count=doc.getNumberOfPages();
   for(let i=1;i<=count;i++){doc.setPage(i);doc.setDrawColor('#dce5ef');doc.line(MARGIN,614,WIDTH-MARGIN,614);doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(muted);doc.text('GarBa · '+i+' / '+count,MARGIN,631);}
   return doc;
  }
  top();
  return {doc,paragraph,heading,card,image,next,finish};
 }
 function projection(){
  if(window.GaPresentation&&!GaPresentation.isCurrent())throw new Error('Completa la proyección antes de descargar el PDF.');
  actualizarReporteBase();
  const w=writer('Tu proyección de retiro · Christian GarBa');
  w.heading('Tu proyección de retiro');
  w.paragraph(text(document.getElementById('rptFecha')),{color:muted});
  for(const page of document.querySelectorAll('.report-view .pdf-page')){
   if(page.classList.contains('pdf-page-strategy')){w.next();w.heading('Resumen ejecutivo de estrategia');}
   for(const block of page.querySelector('.pdf-body').children){
    if(hidden(block)||!text(block))continue;
    if(block.matches('.pdf-section-title')){w.heading(text(block));continue;}
    if(block.matches('.pdf-etapas,.pdf-ingreso-dual,.pdf-ingreso-single,.pdf-summary-grid,.pdf-compare,.pdf-strategy-grid,.pdf-tools-row,.pdf-advisor-proof')){[...block.children].forEach(w.card);continue;}
    if(block.matches('.pdf-next-steps')){for(const step of block.children){w.paragraph(text(step.querySelector('b'))+'. '+text(step.querySelector('strong')),{size:18,bold:true});w.paragraph(text(step.querySelector('small')));}continue;}
    if(block.matches('.pdf-urgency')){w.heading(text(block.querySelector('.pdf-urgency-title')));block.querySelectorAll('.pdf-urg-item').forEach(w.card);w.paragraph(text(block.querySelector('.pdf-urgency-note')));continue;}
    if(block.matches('.pdf-respaldo')){w.heading('Tu asesor y respaldo');for(const img of block.querySelectorAll('img'))w.image(img);block.querySelectorAll('.pdf-asesor-name,.pdf-asesor-title,.pdf-qr-text,.pdf-allianz-claim,.pdf-reguladores').forEach(el=>w.paragraph(text(el)));continue;}
    if(block.matches('.pdf-prospect-hero,.pdf-strategy-hero')){for(const child of block.children)w.card(child);continue;}
    w.card(block);
   }
  }
  return w.finish();
 }
 function strategy(source){
  const w=writer('Tu estrategia de inversión · Christian GarBa');
  w.heading(text(source.querySelector('h1')));
  source.querySelectorAll('.strat-pdf-header p').forEach(el=>w.paragraph(text(el)));
  for(const block of source.querySelectorAll('.strat-pdf-block')){
   w.heading(text(block.querySelector('h2')));
   block.querySelectorAll('p,li').forEach(el=>w.paragraph(text(el)));
  }
  w.heading('Información importante');w.paragraph(text(source.querySelector('.strat-pdf-foot')));
  return w.finish();
 }
 window.GaMobilePDF={projection,strategy,downloadProjection(){return projection().save('GarBa_Proyeccion_Celular.pdf')},projectionBlob(){return projection().output('blob')},downloadStrategy(source,name){return strategy(source).save(name)}};
})();
