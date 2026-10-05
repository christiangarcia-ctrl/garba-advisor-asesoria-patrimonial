/* Presentation layout only: all original inputs, IDs and calculation functions remain in place. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),app=$('legacyApp'),page=app.querySelector('.page'),capture=$('captureView'),results=$('resultsView');
 app.classList.add('calculator-workspace');
 const heading=page.querySelector('.calculator-title');heading.id='gaCalculatorTitle';
 const intro=document.createElement('div');intro.className='calculator-heading';
 const subtitle=document.createElement('p');subtitle.id='gaCalculatorSubtitle';
 heading.before(intro);intro.append(heading,subtitle);
 for(const id of ['nombreOpt','edad']){const input=$(id);input.readOnly=true;input.closest('.fg').hidden=true;}
 const toolbar=document.createElement('div');toolbar.className='calculator-toolbar';
 for(const id of ['pmt','years','metaHoy'])toolbar.append($(id).closest('.fg'));
 const more=document.createElement('button');more.id='gaMoreSettings';more.type='button';more.textContent='Más ajustes';more.className='calculator-more';toolbar.append(more);
 const assumptions=document.createElement('p');assumptions.id='gaAssumptionsSummary';assumptions.className='calculator-assumptions-summary';
 capture.append(toolbar,assumptions);
 const dialog=document.createElement('dialog');dialog.id='gaCalculatorSettings';dialog.className='calculator-settings';
 dialog.setAttribute('aria-labelledby','gaSettingsTitle');dialog.innerHTML='<header><h2 id="gaSettingsTitle">Ajustes de tu escenario</h2><button type="button" id="gaCloseSettings" aria-label="Cerrar ajustes">×</button></header>';
 dialog.append($('lumpSum').closest('.fg'),app.querySelector('.calculator-assumptions'),app.querySelector('.calculator-about'));
 dialog.querySelector('.calculator-assumptions').open=true;
 dialog.querySelector('#advancedToggle').hidden=true;dialog.querySelector('#advancedContent').classList.add('vis');
 app.append(dialog);more.onclick=()=>dialog.showModal();$('gaCloseSettings').onclick=()=>dialog.close();
 dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close()}});
 const tabs=document.createElement('nav');tabs.className='calculator-result-tabs';tabs.setAttribute('aria-label','Resultados del escenario');tabs.setAttribute('role','tablist');
 const labels={projection:'Tu proyección',gap:'Tu meta y la brecha',detail:'Detalle del escenario'};
 const panes={};
 for(const [key,label] of Object.entries(labels)){
  const button=document.createElement('button');button.id='gaTab-'+key;button.type='button';button.dataset.resultTab=key;button.textContent=label;button.setAttribute('role','tab');button.setAttribute('aria-controls','gaPane-'+key);
  button.onclick=()=>select(key);tabs.append(button);
  const pane=document.createElement('section');pane.id='gaPane-'+key;pane.className='calculator-result-pane';pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',button.id);panes[key]=pane;
 }
 results.before(tabs);
 const hero=results.querySelector('.plan-hero'),gap=$('gaProjectionGap'),timeline=app.querySelector('.calculator-timeline');
 const gapHeading=document.createElement('h2');gapHeading.textContent='Lo que deseas y lo que construye tu aportación';
 panes.gap.append(gapHeading,gap);
 panes.projection.append(hero,timeline);
 const income=document.createElement('div');income.id='gaProjectedIncome';income.className='calculator-income-highlight';hero.querySelector('.ph-left').after(income);
 const coverageNode=document.createElement('p');coverageNode.id='gaCoverageSummary';coverageNode.className='calculator-coverage-summary';hero.append(coverageNode);
 const go= document.createElement('button');go.type='button';go.textContent='Explorar tu meta y la brecha →';go.className='calculator-gap-link';go.onclick=()=>select('gap');panes.projection.append(go);
 [...results.children].forEach(child=>panes.detail.append(child));
 results.append(...Object.values(panes));
 const back=$('gaExitToShell');back.classList.add('calculator-return');intro.append(back);
 $('gaGoToValidation').addEventListener('click',()=>select('detail'),true);
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const keys=Object.keys(labels),index=keys.indexOf(selected);select(event.key==='Home'?keys[0]:event.key==='End'?keys.at(-1):keys[(index+(event.key==='ArrowRight'?1:2))%3]);tabs.querySelector('[aria-selected="true"]').focus()});
 let selected='projection';
 function select(key){selected=key;for(const [name,pane] of Object.entries(panes)){pane.hidden=name!==key;const button=$('gaTab-'+name);button.setAttribute('aria-selected',String(name===key));button.tabIndex=name===key?0:-1;}results.scrollTop=0;requestAnimationFrame(()=>{if(typeof chart!=='undefined'&&chart)chart.resize()})}
 function identity(){
  const name=($('nombreOpt').value||$('gaName').value||'').trim().split(/\s+/)[0];
  heading.textContent=name?`${name}, así podemos construir tu retiro a partir de hoy.`:'Así podemos construir tu retiro a partir de hoy.';
  const age=$('edad').value;subtitle.textContent=age?`Tu punto de partida: ${age} años.`:'';
  const fiscal=$('regimenFiscal');assumptions.textContent=`Rendimiento nominal: ${$('rate').value}% · Inflación: ${$('inflation').value}% · ${fiscal.selectedOptions[0]?.textContent||''} · Aportación con incremento anual por inflación`;
 }
 function update(coverage,target){
  identity();
  if(!window.GaPresentation?.isCurrent())return;
  income.innerHTML='<span>Ingreso mensual estimado desde los 65</span><strong></strong><small>Durante 20 años · en pesos futuros · referencia ilustrativa</small>';
  income.querySelector('strong').textContent=$('pmtReal').textContent+'/mes';
  coverageNode.textContent=target>0?`Con esta aportación cubres aproximadamente el ${Math.round(coverage)}% de tu capital objetivo. Proyección sujeta a los supuestos del escenario.`:'Define tu ingreso deseado para comparar este escenario con tu meta.';
 }
 window.GaLayout={update,identity,select,getSelected:()=>selected};select('projection');identity();
 if(window.GaPresentation?.isCurrent())GaPresentation.refresh({force:true});
})();
