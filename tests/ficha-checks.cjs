/* Pruebas sintéticas de ficha de alta: requieren Playwright y navegador. */
const assert = require('node:assert/strict');
module.exports = async function fichaChecks({ make, load, origin, wait }) {
  const p = await make();
  await p.setViewportSize({ width:1440, height:780 });
  await load(p, origin, false);
  await p.evaluate(() => {
    document.getElementById('gaName').value = 'Cliente Prueba';
    document.getElementById('pmt').value = '3000';
    document.getElementById('years').value = '25';
    document.getElementById('regimenFiscal').value = '93';
  });
  await p.locator('#lMenu summary').click();
  assert.equal(await p.locator('#lMenuItems button').first().innerText(), 'Iniciar captura');
  await p.locator('#lMenuItems button').first().click();
  assert(await p.locator('#gaFicha').isVisible());
  assert.equal(await p.locator('#fa_nombre').inputValue(), 'Cliente Prueba');
  await p.locator('#faNav5').click();
  assert.equal(await p.locator('#fa_aportacion').inputValue(), '3000');
  assert.equal(await p.locator('#fa_plazo').inputValue(), '25');
  await p.locator('#faNav7').click();
  await p.locator('#fa_b1porcentaje').fill('80');
  assert((await p.locator('#faSum').innerText()).includes('falta 20'));
  await p.locator('#fa_b2porcentaje').fill('20');
  assert.equal(await p.locator('#faSum').innerText(), '100 % ✓');
  await p.locator('#faNav9').click();
  await p.locator('#fa_tipoCargo').selectOption('Tarjeta de crédito');
  await p.locator('#fa_numeroTarjeta').fill('4111111111111111');
  await p.locator('#fa_vencimiento').fill('12/28');
  const hasSecret = await p.evaluate(() =>
    [localStorage, sessionStorage].some(storage => Object.keys(storage)
      .some(key => String(storage.getItem(key)).includes('4111111111111111') || String(storage.getItem(key)).includes('12/28'))));
  assert.equal(hasSecret, false, 'Card and expiry never enter browser storage');
  await p.locator('#faNav1').click();
  await p.locator('#fa_rfc').fill('PRUE800101AA1');
  await p.reload();
  await wait(400);
  await p.evaluate(() => GaFicha.open());
  assert.equal(await p.locator('#fa_nombre').inputValue(), 'Cliente Prueba');
  assert.equal(await p.locator('#fa_rfc').inputValue(), 'PRUE800101AA1');
  await p.locator('#faNav9').click();
  await p.locator('#fa_tipoCargo').selectOption('Tarjeta de crédito');
  assert.equal(await p.locator('#fa_numeroTarjeta').inputValue(), '');
  await p.locator('#fa_tipoCargo').selectOption('Cuenta de cheques');
  await p.locator('#fa_clabe').fill('123456789012345678');
  assert.equal(await p.evaluate(() => [localStorage, sessionStorage].some(storage =>
    Object.keys(storage).some(key => String(storage.getItem(key)).includes('123456789012345678')))), false);
  await p.evaluate(() => {
    window.showDirectoryPicker = undefined;
    window.__fichaCopied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable:true,
      value: { writeText: async text => { window.__fichaCopied = text; } } });
  });
  await p.locator('#faCopy').click();
  assert((await p.evaluate(() => window.__fichaCopied)).includes('FICHA DE ALTA'));
  const download = p.waitForEvent('download');
  await p.locator('#faSave').click();
  const file = await download;
  assert.match(file.suggestedFilename(), /^Alta - Cliente Prueba - \d{4}-\d{2}-\d{2}\.pdf$/);
  assert.equal(await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true);
  await p.locator('#faBack').click();
  assert(await p.locator('#gaLienzo').isVisible());
  assert.equal(await p.evaluate(() => GaLienzo.act), 1);
  await p.close();
  const classic = await make();
  await load(classic, origin, true);
  assert.equal(await classic.evaluate(() => GA_FLOW_CLASSIC), true);
  assert.equal(await classic.locator('#gaFicha').count(), 0);
  await classic.close();
};
