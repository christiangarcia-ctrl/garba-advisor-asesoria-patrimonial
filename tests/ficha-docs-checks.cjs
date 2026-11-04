const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const synthetic = `RFC: PELJ800101AB1
CURP: PELJ800101HDFRPN09
Nombre (s): JUAN
Primer Apellido: PÉREZ
Segundo Apellido: LÓPEZ
Código Postal: 12345
Tipo de Vialidad: CALLE
Nombre de Vialidad: REFORMA
Número Exterior: 123
Número Interior: 4
Nombre de la Colonia: CENTRO
Nombre del Municipio o Demarcación Territorial: MUNICIPIO FICTICIO
Nombre de la Localidad: CIUDAD FICTICIA
Nombre de la Entidad Federativa: SONORA
Actividades Económicas
Orden Actividad Económica Porcentaje Fecha Inicio
1 Comercio ficticio 80 01/01/2020
2 Servicios ficticios 20 01/01/2020
Regímenes`;
function pureChecks() {
  const context = { window: {}, document: { currentScript: { src: 'http://localhost/ficha-docs.js' } }, URL };
  vm.runInNewContext(fs.readFileSync(require.resolve('../ficha-docs.js'), 'utf8'), context);
  const api = context.window.GaFichaDocs, data = api.parseCSFText(synthetic);
  for (const [key, value] of Object.entries({ rfc: 'PELJ800101AB1', curp: 'PELJ800101HDFRPN09', nombre: 'JUAN PÉREZ LÓPEZ', cp: '12345', calle: 'CALLE REFORMA 123', interior: '4', colonia: 'CENTRO', estado: 'SONORA', giro: 'Comercio ficticio', nacimiento: '01/01/1980', genero: 'Masculino', nacionalidad: 'Mexicana' })) assert.equal(data[key], value, key);
  const ine = api.parseINEText('IDMEX1234567890<<<<<<<<<<<<<<<\n8001011H3012310MEX<<<<<<<<<<<\nPEREZ<LOPEZ<<JUAN<<<<<<<<<<<<');
  assert.equal(ine.nombre, 'JUAN PEREZ LOPEZ'); assert.equal(ine.nacimiento, '01/01/1980');
  assert.equal(api.parseCSFText('RFC: INVALIDO\nCURP: INVALIDA\nCódigo Postal: 1234').rfc, undefined);
  assert.equal(api.parseAddressText('Referencia 12345').cp, undefined);
}
module.exports = async function ({ make, load, origin }) {
  pureChecks();
  const p = await make();
  await load(p, origin, false);
  const requests = [];
  p.on('request', request => requests.push(request.url()));
  await p.evaluate(() => { GaFicha.open(); GaFicha.applyDocument({ nombre: 'Nombre previo' }); });
  await p.locator('.fd-area summary').click();
  assert.equal(requests.some(url => url.includes('/vendor/')), false, 'Carga diferida');
  const pdf = await p.evaluate(text => {
    const doc = new jspdf.jsPDF(); doc.setFontSize(10); doc.text(text.split('\n'), 10, 15);
    return Array.from(new Uint8Array(doc.output('arraybuffer')));
  }, synthetic);
  await p.locator('#fd-sat').setInputFiles({ name: 'constancia-ficticia.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf) });
  await p.locator('.fd-results h3').waitFor({ timeout: 30000 });
  assert.equal(await p.locator('.fd-results h3').innerText(), 'Esto encontramos');
  assert.equal(await p.locator('.fd-results input[data-key="nombre"]').isChecked(), false);
  assert((await p.locator('.fd-results').innerText()).includes('Actual: Nombre previo'));
  await p.locator('.fd-results button').click();
  assert.equal(await p.locator('#fa_rfc').inputValue(), 'PELJ800101AB1');
  assert.equal(await p.locator('#fa_nombre').inputValue(), 'Nombre previo');
  const stored = await p.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
  for (const value of ['PELJ800101AB1', 'PELJ800101HDFRPN09', 'REFORMA', 'constancia-ficticia.pdf']) assert(!stored.includes(value), 'Documento en almacenamiento: ' + value);
  assert(requests.every(url => { const u = new URL(url); return u.origin === new URL(origin).origin && u.pathname.includes('/vendor/'); }), 'Sólo recursos locales de vendor');
  await p.close();
};
if (require.main === module) { pureChecks(); console.log('Lectores puros: OK'); }
