/* Ficha de alta OptiMaxx Plus. Independiente de los cálculos y las sesiones del asesor. */
(function () {
  'use strict';
  const sensitive = new Set(['numeroTarjeta', 'vencimiento', 'clabe']);
  const sections = [
    { title: 'Información personal', fields: [
      ['nombre', 'Nombre completo (como aparece en INE)'],
      ['nacimiento', 'Fecha de nacimiento (DD/MM/AAAA)'],
      ['nacionalidad', 'Nacionalidad'],
      ['genero', 'Género', 'select', ['Femenino', 'Masculino', 'Otro']],
      ['rfc', 'RFC'], ['curp', 'CURP (si lo solicita el portal)']
    ] },
    { title: 'Información de contacto', fields: [
      ['telefono', 'Teléfono celular', 'tel'], ['correo', 'Correo electrónico', 'email']
    ] },
    { title: 'Domicilio', fields: [
      ['calle', 'Calle y número exterior'], ['interior', 'Número interior (si aplica)'],
      ['colonia', 'Colonia'], ['cp', 'Código postal'],
      ['municipio', 'Municipio / Alcaldía'], ['ciudad', 'Ciudad'],
      ['estado', 'Estado'], ['pais', 'País']
    ] },
    { title: 'Información laboral', fields: [
      ['giro', 'Giro o actividad económica'], ['ocupacion', 'Ocupación / profesión'],
      ['ingresos', 'Principal fuente de ingresos'], ['empresa', 'Nombre de empresa o negocio (si aplica)']
    ] },
    { title: 'Información del plan', fields: [
      ['producto', 'Producto', 'fixed'],
      ['regimen', 'Régimen fiscal', 'select', ['Artículo 93', 'Artículo 151', 'Ambos']],
      ['aportacion', 'Aportación mensual (MXN)', 'number'],
      ['plazo', 'Plazo de aportaciones', 'select', ['10', '15', '20', '25']]
    ] },
    { title: 'Perfil de inversión', fields: [
      ['estudios', 'Nivel de estudios', 'select', ['Primaria', 'Secundaria', 'Preparatoria', 'Licenciatura', 'Posgrado', 'Otro']],
      ['notaPerfil', 'Las demás preguntas del perfilamiento se responden directamente en el portal de Allianz.', 'note']
    ] },
    { title: 'Beneficiarios', fields: [
      ['b1', 'Beneficiario 1', 'heading'],
      ['b1nombre', 'Nombre completo'], ['b1parentesco', 'Parentesco'],
      ['b1nacimiento', 'Fecha de nacimiento (si se solicita)'], ['b1porcentaje', 'Porcentaje', 'number'],
      ['b2', 'Beneficiario 2', 'heading'],
      ['b2nombre', 'Nombre completo'], ['b2parentesco', 'Parentesco'],
      ['b2nacimiento', 'Fecha de nacimiento (si se solicita)'], ['b2porcentaje', 'Porcentaje', 'number'],
      ['b3', 'Beneficiario 3 (si aplica)', 'heading'],
      ['b3nombre', 'Nombre completo'], ['b3parentesco', 'Parentesco'],
      ['b3nacimiento', 'Fecha de nacimiento (si se solicita)'], ['b3porcentaje', 'Porcentaje', 'number']
    ] },
    { title: 'Documentación', fields: [
      ['docIne', 'Identificación oficial vigente', 'check'],
      ['docDomicilio', 'Comprobante de domicilio', 'check'],
      ['docRfc', 'RFC / constancia fiscal, si se requiere', 'check'],
      ['docExtra', 'Documentación complementaria solicitada por Allianz', 'check'],
      ['docDatos', 'Confirmación de que los datos coinciden con los documentos', 'check']
    ] },
    { title: 'Primer pago', fields: [
      ['importe', 'Importe inicial', 'number'],
      ['pagoAhora', '¿Desea realizar el primer pago en ese momento?', 'select', ['Sí', 'No']],
      ['tipoCargo', 'Tipo de cargo', 'select', ['Tarjeta de crédito', 'Tarjeta de débito', 'Cuenta de cheques']],
      ['numeroTarjeta', 'Número de tarjeta', 'secret'],
      ['vencimiento', 'Vencimiento (MM/AA)', 'secret'],
      ['clabe', 'CLABE (18 dígitos)', 'secret'],
      ['institucion', 'Institución financiera'], ['fechaCobro', 'Fecha solicitada de aplicación del cobro', 'date'],
      ['avisoPago', 'Por seguridad, los datos de la tarjeta o CLABE no se guardan en el navegador: solo van en el PDF.', 'note']
    ] },
    { title: 'Validación final con el cliente', fields: [
      ['valDatos', 'Confirmó sus datos personales', 'check'],
      ['valPlazo', 'Revisó aportación, periodicidad y plazo', 'check'],
      ['valCostos', 'Revisó condiciones, costos y restricciones', 'check'],
      ['valBenef', 'Confirmó beneficiarios y porcentajes', 'check'],
      ['valPerfil', 'Revisó el perfil de inversión', 'check'],
      ['valDoc', 'Recibió o revisó la documentación correspondiente', 'check'],
      ['valDudas', 'Se aclararon sus dudas', 'check'],
      ['valDecision', 'Confirmó su decisión de continuar', 'check'],
      ['valAutorizacion', 'Revisó y autorizó la solicitud mediante el procedimiento de Allianz', 'check'],
      ['valPago', 'Se confirmó el estado del primer pago', 'check'],
      ['estadoProceso', 'Estado real del proceso', 'select', [
        'Datos recopilados', 'Solicitud en captura', 'Solicitud autorizada',
        'Pago pendiente', 'Pago confirmado', 'Pendiente de aclaración'
      ]]
    ] }
  ];
  let values = {};
  let current = 0;
  let key = '';
  let lastVisible = false;
  let root = null;
  let pendingSave = false;
  const $ = id => document.getElementById(id);
  const defaults = () => ({ nacionalidad: 'Mexicana', pais: 'México', producto: 'OptiMaxx Plus' });
  const val = id => String(values[id] == null ? '' : values[id]);
  const checked = id => values[id] === true;
  const fieldList = sections.flatMap(section => section.fields);
  const fieldByKey = Object.fromEntries(fieldList.map(field => [field[0], field]));
  const eligible = field => !['note', 'heading'].includes(field[2]);
  function sessionKey() {
    try {
      let session = sessionStorage.getItem('gaSessionKey');
      if (!session) {
        session = 'ficha-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
        sessionStorage.setItem('gaSessionKey', session);
      }
      return 'gaFichaDraft:' + session;
    } catch (_) {
      return '';
    }
  }
  function loadDraft() {
    key = sessionKey();
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
    values = { ...defaults(), ...Object.fromEntries(Object.entries(saved).filter(entry => fieldByKey[entry[0]] && !sensitive.has(entry[0]))) };
  }
  function storeDraft() {
    if (!key) return;
    const draft = Object.fromEntries(Object.entries(values).filter(([name]) => !sensitive.has(name) && fieldByKey[name]));
    try { localStorage.setItem(key, JSON.stringify(draft)); } catch (_) {}
  }
  function from(id) { return $(id) && $(''+id).value ? $(''+id).value.trim() : ''; }
  function prefill() {
    const known = window.__gaKnown || {};
    const pre = {
      nombre: from('gaName') || known.nom || known.nombre,
      nacimiento: from('gaBirth') || from('preBirth') || known.fechaNacimiento || known.nacimiento,
      telefono: from('gaPhone') || from('prePhone') || known.telefono || known.phone,
      correo: from('gaEmail') || from('preEmail') || known.correo || known.email,
      ocupacion: from('gaProfession') || known.profesion || known.ocupacion,
      aportacion: from('pmt') || from('gaPmt') || known.ahorro,
      plazo: from('years') || known.plazo,
      importe: from('pmt') || from('gaPmt') || known.ahorro
    };
    const reg = from('regimenFiscal') || from('gaTax') || known.regimenFiscal || known.tax;
    if (String(reg) === '151' || String(reg).includes('151')) pre.regimen = 'Artículo 151';
    else if (String(reg) === '93' || String(reg).includes('93')) pre.regimen = 'Artículo 93';
    for (const [name, value] of Object.entries(pre)) {
      if (!values[name] && value != null && String(value).trim()) values[name] = String(value).trim();
    }
    if (!['10', '15', '20', '25'].includes(val('plazo'))) values.plazo = '';
    storeDraft();
  }
  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }
  function init() {
    if (root) return;
    root = document.createElement('section');
    root.id = 'gaFicha';
    root.hidden = true;
    root.setAttribute('aria-label', 'Ficha de alta OptiMaxx Plus');
    root.innerHTML =
      '<header class="fa-header"><div><h1>Ficha de alta — OptiMaxx Plus Allianz</h1><p id="faClient"></p></div>' +
      '<div class="fa-progress"><strong id="faPercent"></strong><div class="fa-bar"><span id="faBar"></span></div></div>' +
      '<button type="button" id="faBack">← Volver a la asesoría</button></header>' +
      '<div class="fa-body"><nav id="faNavigation" aria-label="Secciones de la ficha"></nav>' +
      '<main class="fa-form"><h2 id="faSectionTitle"></h2><div id="faFields" class="fa-fields"></div>' +
      '<div class="fa-steps"><button id="faPrevious" type="button">Anterior</button>' +
      '<button id="faNext" type="button">Siguiente</button></div></main></div>' +
      '<footer class="fa-footer"><div><button id="faSave" class="fa-primary" type="button">Guardar en mi Mac (PDF)</button>' +
      '<button id="faCopy" type="button">Copiar ficha</button><button type="button" id="faFolder">Cambiar carpeta</button>' +
      '<button type="button" id="faLegacy">Abrir precaptura anterior</button></div><small id="faStatus" role="status"></small></footer>';
    document.body.appendChild(root);
    $('faBack').onclick = close;
    $('faPrevious').onclick = () => go(current - 1);
    $('faNext').onclick = () => go(current + 1);
    $('faSave').onclick = savePdf;
    $('faCopy').onclick = copyFicha;
    $('faFolder').onclick = chooseFolder;
    $('faLegacy').onclick = openLegacy;
    root.addEventListener('keydown', event => {
      if (event.key !== 'Enter' || event.isComposing || event.target.tagName === 'BUTTON') return;
      event.preventDefault();
      const inputs = [...$('faFields').querySelectorAll('input,select')].filter(e => !e.disabled);
      const next = inputs[inputs.indexOf(event.target) + 1];
      if (next) next.focus();
      else if (current < sections.length - 1) go(current + 1);
    });
  }
  function beneficiaryTotal() {
    return [1, 2, 3].reduce((total, n) => total + (Number(val('b' + n + 'porcentaje')) || 0), 0);
  }
  function beneficiaryMessage() {
    const total = beneficiaryTotal();
    if (Math.abs(total - 100) < 0.0001) return '100 % ✓';
    return total < 100 ? 'Suma: ' + total + ' % · falta ' + (100 - total) + ' %' :
      'Suma: ' + total + ' % · excede por ' + (total - 100) + ' %';
  }
  function progress(section) {
    const fields = section.fields.filter(eligible).filter(f => !sensitive.has(f[0]));
    const done = fields.filter(f => f[2] === 'check' ? checked(f[0]) : !!val(f[0])).length;
    return [done, fields.length];
  }
  function refreshProgress() {
    const counts = sections.map(progress);
    const done = counts.reduce((sum, c) => sum + c[0], 0);
    const total = counts.reduce((sum, c) => sum + c[1], 0);
    const percent = total ? Math.round(100 * done / total) : 0;
    $('faPercent').textContent = percent + '% completado';
    $('faBar').style.width = percent + '%';
    $('faClient').textContent = val('nombre') || 'Cliente por confirmar';
    [...$('faNavigation').children].forEach((button, index) => {
      button.querySelector('small').textContent = counts[index][0] + '/' + counts[index][1];
    });
  }
  function renderNavigation() {
    const nav = $('faNavigation');
    nav.replaceChildren();
    sections.forEach((section, index) => {
      const button = make('button', index === current ? 'fa-active' : '');
      button.type = 'button';
      button.id = 'faNav' + (index + 1);
      button.append(make('span', '', (index + 1) + '. ' + section.title), make('small', '', ''));
      button.onclick = () => go(index);
      nav.append(button);
    });
  }
  function showField(field, target) {
    const [name, label, kind = 'text', choices] = field;
    if (kind === 'heading') {
      target.append(make('h3', 'fa-subtitle', label));
      return;
    }
    if (kind === 'note') {
      target.append(make('p', 'fa-note', label));
      return;
    }
    if (name === 'numeroTarjeta' || name === 'vencimiento') {
      if (!val('tipoCargo').startsWith('Tarjeta')) return;
    }
    if (name === 'clabe' && val('tipoCargo') !== 'Cuenta de cheques') return;
    const wrap = make('label', 'fa-field' + (kind === 'check' ? ' fa-checkbox' : ''));
    if (kind !== 'check') wrap.append(make('span', '', label));
    let input;
    if (kind === 'select') {
      input = make('select');
      const blank = make('option', '', 'Selecciona');
      blank.value = '';
      input.append(blank);
      choices.forEach(choice => {
        const option = make('option', '', choice);
        option.value = choice;
        input.append(option);
      });
      input.value = val(name);
    } else {
      input = make('input');
      input.type = kind === 'check' ? 'checkbox' : kind === 'secret' ? 'password' :
        kind === 'fixed' ? 'text' : kind === 'number' ? 'number' :
        kind === 'email' ? 'email' : kind === 'tel' ? 'tel' : kind === 'date' ? 'date' : 'text';
      if (kind === 'secret') {
        input.autocomplete = 'off';
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
      }
      if (kind === 'number') {
        input.min = '0';
        if (name.includes('porcentaje')) input.max = '100';
      }
      if (kind === 'fixed') input.readOnly = true;
      if (kind === 'check') input.checked = checked(name);
      else input.value = val(name);
    }
    input.id = 'fa_' + name;
    input.name = 'fa_' + name;
    input.addEventListener(kind === 'check' || kind === 'select' ? 'change' : 'input', () => {
      values[name] = kind === 'check' ? input.checked : input.value;
      if (name === 'aportacion' && !values.importe) {
        values.importe = input.value;
      }
      storeDraft();
      refreshProgress();
      if (name.endsWith('porcentaje') && $('faSum')) $('faSum').textContent = beneficiaryMessage();
      if (name === 'tipoCargo') renderFields();
    });
    if (kind === 'check') {
      wrap.append(input, make('span', '', label));
    } else if (kind === 'secret') {
      const line = make('div', 'fa-secret');
      const eye = make('button', '', 'Mostrar');
      eye.type = 'button';
      eye.id = 'faEye' + name;
      eye.setAttribute('aria-label', 'Mostrar u ocultar ' + label);
      eye.onclick = () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        eye.textContent = isHidden ? 'Ocultar' : 'Mostrar';
      };
      line.append(input, eye);
      wrap.append(line);
    } else wrap.append(input);
    target.append(wrap);
  }
  function renderFields() {
    const target = $('faFields');
    target.replaceChildren();
    $('faSectionTitle').textContent = (current + 1) + '. ' + sections[current].title;
    sections[current].fields.forEach(field => showField(field, target));
    if (current === 6) {
      const sum = make('p', 'fa-sum', beneficiaryMessage());
      sum.id = 'faSum';
      sum.setAttribute('role', 'status');
      target.append(sum);
    }
    $('faPrevious').disabled = current === 0;
    $('faNext').disabled = current === sections.length - 1;
    [...$('faNavigation').children].forEach((button, index) => button.classList.toggle('fa-active', index === current));
    refreshProgress();
  }
  function go(index) {
    if (index < 0 || index >= sections.length) return;
    current = index;
    renderFields();
    $('faFields').scrollTop = 0;
  }
  function open() {
    if (window.GA_FLOW_CLASSIC) return;
    init();
    if (root.hidden) {
      loadDraft();
      prefill();
      const lienzo = $('gaLienzo');
      lastVisible = !!lienzo && !lienzo.hidden;
      if (lienzo) lienzo.hidden = true;
    }
    root.hidden = false;
    document.body.classList.add('ga-lienzo');
    renderNavigation();
    renderFields();
  }
  function close() {
    if (!root) return;
    root.hidden = true;
    if (lastVisible && $('gaLienzo') && !window.GA_FLOW_CLASSIC) $('gaLienzo').hidden = false;
    if (!lastVisible) document.body.classList.remove('ga-lienzo');
  }
  function openLegacy() {
    close();
    const oldButton = $('gaPostCalcContinue');
    if (oldButton) {
      oldButton.click();
      window.GaLienzo && window.GaLienzo.suspend();
    }
  }
  function textRows(includeSecrets) {
    const shown = name => {
      const v = val(name);
      if (!v) return '';
      if (name === 'aportacion' || name === 'importe') return Number(v) ? Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }) : v;
      if (name === 'plazo') return v + ' años';
      return v;
    };
    const rows = ['FICHA DE ALTA — OPTIMAXX PLUS ALLIANZ', 'Asesor: Christian García',
      'Fecha: ' + new Date().toLocaleDateString('es-MX'), ''];
    sections.forEach((section, index) => {
      rows.push((index + 1) + '. ' + section.title);
      section.fields.forEach(field => {
        const [name, label, kind] = field;
        if (kind === 'heading') rows.push('  ' + label);
        else if (kind === 'note') rows.push('  ' + label);
        else if (kind === 'check') rows.push('  ' + (checked(name) ? '[x]' : '[ ]') + ' ' + label); // la fuente del PDF no trae ☑/☐
        else rows.push('  - ' + label + ': ' +
          (sensitive.has(name) && !includeSecrets ? '—' : shown(name) || '—'));
      });
      if (index === 6) rows.push('  ' + beneficiaryMessage());
      rows.push('');
    });
    rows.push('Documento confidencial con datos personales y bancarios. No compartir. Capturar en el portal de Allianz y eliminar cuando ya no se necesite.');
    return rows;
  }
  async function copyFicha() {
    const include = [...sensitive].some(name => !!val(name)) ?
      window.confirm('¿Incluir los datos de la tarjeta/CLABE en lo copiado?') : false;
    const content = textRows(include).join('\n');
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Portapapeles no disponible');
      await navigator.clipboard.writeText(content);
      $('faStatus').textContent = 'Ficha copiada al portapapeles.';
    } catch (_) {
      const el = make('textarea');
      el.value = content;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      root.append(el);
      el.select();
      const ok = document.execCommand('copy');
      el.remove();
      $('faStatus').textContent = ok ? 'Ficha copiada al portapapeles.' : 'No se pudo copiar; revisa los permisos.';
    }
  }
  function pdfBlob() {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('No se encontró la librería PDF existente.');
    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    let y = 17;
    const margin = 16, width = 178;
    const advance = (space = 6) => {
      if (y + space > 276) {
        pdf.addPage();
        y = 18;
      }
    };
    const add = (line, kind = 'text') => {
      if (!line) { y += 3; return; }
      const heading = /^\d+\.\s/.test(line) || line.startsWith('FICHA DE ALTA');
      pdf.setFont('helvetica', heading ? 'bold' : 'normal');
      pdf.setFontSize(line.startsWith('FICHA DE ALTA') ? 14 : heading ? 11 : 9);
      const indent = line.startsWith('  ') ? 4 : 0;
      const clean = line.replace(/^[ ]+/g, '');
      const parts = pdf.splitTextToSize(clean, width - indent);
      advance(parts.length * 5 + 3);
      pdf.text(parts, margin + indent, y);
      y += parts.length * (heading ? 5.5 : 4.8) + (heading ? 3 : 1.5);
    };
    textRows(true).forEach(row => add(row));
    return pdf.output('blob');
  }
  function filename() {
    const name = (val('nombre') || 'Sin nombre').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return 'Alta - ' + name + ' - ' + yyyy + '-' + mm + '-' + dd + '.pdf';
  }
  function idb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { resolve(null); return; }
      const req = indexedDB.open('gaFichaStorage', 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('settings')) req.result.createObjectStore('settings');
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }
  async function folderGet() {
    const db = await idb();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const txn = db.transaction('settings', 'readonly');
      const req = txn.objectStore('settings').get('folder');
      req.onsuccess = () => { resolve(req.result || null); db.close(); };
      req.onerror = () => { reject(req.error); db.close(); };
    });
  }
  async function folderSet(handle) {
    const db = await idb();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const txn = db.transaction('settings', 'readwrite');
      txn.objectStore('settings').put(handle, 'folder');
      txn.oncomplete = () => { db.close(); resolve(); };
      txn.onerror = () => { db.close(); reject(txn.error); };
    });
  }
  async function chooseFolder() {
    if (!window.showDirectoryPicker) {
      $('faStatus').textContent = 'Este navegador guardará el PDF en Descargas.';
      return null;
    }
    try {
      $('faStatus').textContent = 'Elige la carpeta donde guardar las altas';
      const handle = await window.showDirectoryPicker({ startIn: 'desktop', mode: 'readwrite' });
      await folderSet(handle);
      $('faStatus').textContent = 'Carpeta elegida: ' + handle.name;
      return handle;
    } catch (error) {
      if (error.name !== 'AbortError') $('faStatus').textContent = 'No se pudo elegir carpeta; se usará Descargas.';
      return null;
    }
  }
  async function saveInFolder(handle, blob, name) {
    if (!handle) return false;
    let permission = 'granted';
    if (handle.queryPermission) permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted' && handle.requestPermission) permission = await handle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') return false;
    const file = await handle.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    await writable.write(blob);
    await writable.close();
    $('faStatus').textContent = 'PDF guardado en ' + handle.name + ': ' + name;
    return true;
  }
  function download(blob, name) {
    const href = URL.createObjectURL(blob);
    const a = make('a');
    a.href = href;
    a.download = name;
    root.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 15000);
    $('faStatus').textContent = 'Descarga iniciada: ' + name;
  }
  async function savePdf() {
    if (pendingSave) return;
    pendingSave = true;
    $('faSave').disabled = true;
    try {
      let handle = null;
      if (window.showDirectoryPicker) {
        try { handle = await folderGet(); } catch (_) {}
        if (!handle) handle = await chooseFolder();
      }
      const name = filename();
      const blob = pdfBlob();
      let saved = false;
      if (handle) {
        try { saved = await saveInFolder(handle, blob, name); } catch (_) {}
      }
      if (!saved) download(blob, name);
      if (window.confirm('PDF guardado. ¿Limpiar la ficha?')) {
        if (key) {
          try { localStorage.removeItem(key); } catch (_) {}
        }
        values = defaults();
        current = 0;
        renderNavigation();
        renderFields();
        $('faStatus').textContent = 'Ficha limpiada. Conserva el PDF en un lugar seguro.';
      }
    } catch (error) {
      $('faStatus').textContent = 'No se pudo generar el PDF: ' + error.message;
    } finally {
      pendingSave = false;
      $('faSave').disabled = false;
    }
  }
  window.GaFicha = { open, close };
})();
