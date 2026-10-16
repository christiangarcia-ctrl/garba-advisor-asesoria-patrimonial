/* Reuse the existing print design when rasterizing the executive report into the ZIP. */
(()=>{
 'use strict';
 const capture=window.html2canvas;
 if(!capture)return;
 window.html2canvas=(element,options={})=>{
  if(!element.matches('.report-view .pdf-page'))return capture(element,options);
  const rules=[];
  for(const sheet of document.styleSheets){
   try{
    for(const rule of sheet.cssRules){
     if(rule.type===CSSRule.MEDIA_RULE&&rule.conditionText==='print'){
      for(const child of rule.cssRules)if(child.type!==CSSRule.PAGE_RULE)rules.push(child.cssText);
     }
    }
   }catch{/* Cross-origin font sheets do not contain the local report design. */}
  }
  const previous=options.onclone;
  return capture(element,{...options,onclone:async(doc,cloned)=>{
   if(previous)await previous(doc,cloned);
   const style=doc.createElement('style');
   style.textContent=rules.join('\n');doc.head.append(style);
   await doc.fonts.ready;
  }});
 };
})();
