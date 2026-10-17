/* Composition only: reuse original fields, events, validation and financial calculations. */
(()=>{
 'use strict';
 const shell=document.getElementById('gaShell'),wrap=shell.querySelector('.ga-wrap');
 shell.classList.add('experience-composed');
 const rail=document.createElement('aside');rail.className='experience-rail';
 rail.innerHTML='<div class="experience-signature"><img src="img/logo-garba.png" alt=""/><div><strong>Christian GarBa</strong><span>Consultoría patrimonial</span></div></div><div class="experience-rail-heading"><span>ASESORÍA PERSONAL</span><h2>Tu historia.<br/>Tu estrategia.</h2></div><ol class="experience-route"><li data-chapter="0"><b>01</b><span>Conectar<small>Lo que importa para ti</small></span></li><li data-chapter="1"><b>02</b><span>Entender<small>Tu punto de partida</small></span></li><li data-chapter="2"><b>03</b><span>Construir<small>Tu ruta patrimonial</small></span></li></ol><div class="experience-rail-footer"><span>Distribuidor autorizado</span><img src="img/logo-allianz.png" alt="Allianz"/><small>La estrategia empieza<br/>con una buena conversación.</small></div>';
 wrap.prepend(rail);
 const intro=shell.querySelector('.ga-intro-layout');
 intro.querySelector('h2').innerHTML='Tu vida primero.<br/><span class="ga-hl">Después, la estrategia.</span>';
 const route=document.createElement('div');route.className='experience-map';
 route.innerHTML='<span class="experience-overline">LO QUE CONSTRUIREMOS JUNTOS</span><h3>Del propósito<br/>a un plan.</h3><div class="experience-map-step"><i>01</i><div><strong>Tu vida</strong><p>Qué quieres proteger y conseguir.</p></div></div><div class="experience-map-step"><i>02</i><div><strong>Tus números</strong><p>Tu capacidad, tu horizonte y tu meta.</p></div></div><div class="experience-map-step"><i>03</i><div><strong>Tu estrategia</strong><p>Una decisión informada, a tu ritmo.</p></div></div><span class="experience-map-end">PROPÓSITO → CLARIDAD → DECISIÓN</span>';
 intro.append(route);
 shell.querySelectorAll('.ga-scene').forEach(scene=>{
  if(scene.dataset.scene==='0'||scene.dataset.scene.startsWith('v2'))return;
  const children=[...scene.children],heading=document.createElement('header'),body=document.createElement('div');
  heading.className='experience-question';body.className='experience-answer';
  children.forEach(child=>{if(child.matches('.ga-kicker,h2,p'))heading.append(child);else body.append(child)});
  if(!heading.children.length)return;
  scene.append(heading,body);scene.classList.add('experience-scene');
 });
 function sync(){
  const active=shell.querySelector('.ga-scene.active'),id=active?.dataset.scene;
  const chapter=['0','1'].includes(id)?0:['1b','2','3','4'].includes(id)?1:2;
  rail.querySelectorAll('[data-chapter]').forEach((item,i)=>{item.classList.toggle('is-current',i===chapter);item.classList.toggle('is-complete',i<chapter);item.setAttribute('aria-current',i===chapter?'step':'false')});
 }
 sync();new MutationObserver(sync).observe(shell.querySelector('.ga-main'),{subtree:true,attributes:true,attributeFilter:['class']});

 const pre=document.getElementById('gaPreopenView');pre.classList.add('experience-closing');
 const preHead=pre.querySelector('.ga-pre-head'),preSide=pre.querySelector('.ga-pre-side');preSide.prepend(preHead);
 const strategy=document.getElementById('gaStrategyView');strategy.classList.add('experience-closing');
 const strategyCard=strategy.querySelector('.strat-card'),strategyContext=document.createElement('aside'),strategyMain=document.createElement('main');
 strategyContext.className='experience-strategy-context';strategyMain.className='experience-strategy-main';
 [...strategyCard.children].forEach(child=>{if(child.matches('.strat-head,.strat-why,.strat-defs,.strat-fees,.strat-disclaimer,.strat-review'))strategyContext.append(child);else strategyMain.append(child)});strategyCard.append(strategyContext,strategyMain);
 ['gaReferralView','gaLaterView','gaDecisionView'].forEach(id=>document.getElementById(id).classList.add('experience-closing'));
 const tools=[...document.querySelectorAll('.ga-product-tool')];
 const symbols=['<path d="M8 28V9h18v19M4 28h26M12 14h3m5 0h2M12 19h3m5 0h2M14 28v-5h6v5"/>','<path d="M5 27h26M8 23v-8m7 8V9m7 14V5m7 18V12"/>','<path d="M18 4l12 5v9c0 7-7 12-12 15C13 30 6 25 6 18V9zM12 18l4 4 8-9"/>'];
 tools.forEach((tool,i)=>{const symbol=document.createElement('div');symbol.className='experience-tool-symbol';symbol.setAttribute('aria-hidden','true');symbol.innerHTML='<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+symbols[i%symbols.length]+'</svg><span>0'+(i+1)+'</span>';tool.prepend(symbol)});
 const results=document.getElementById('legacyApp');results.classList.add('experience-calculator');
 document.addEventListener('ga:projection-updated',()=>{
  if(typeof chart==='undefined'||!chart)return;
  chart.data.datasets[0].borderColor='#315D76';chart.data.datasets[0].backgroundColor='rgba(49,93,118,.10)';
  if(chart.data.datasets[1])chart.data.datasets[1].borderColor='#A57E4A';
  chart.options.scales.x.ticks.color='#607082';chart.options.scales.y.ticks.color='#607082';chart.options.scales.y.grid.color='#DDE4E8';chart.update('none');
 });
})();
