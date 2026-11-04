/* Lectura local: ningún archivo ni texto sale de este proceso del navegador. */
(function () {
  'use strict';
  const norm = s => String(s || '').toUpperCase().normalize('NFD').replace(/N\u0303/g, 'Ñ').replace(/[\u0300-\u036f]/g, '');
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const rfcRE = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
  const curpRE = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
  function date(s, century) {
    const y = century + Number(s.slice(0, 2)), m = Number(s.slice(2, 4)), d = Number(s.slice(4, 6));
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? `${s.slice(4, 6)}/${s.slice(2, 4)}/${y}` : '';
  }
  function identity(text, out) {
    const t = norm(text).replace(/\bCURP\s*:\s*/g, 'CURP ');
    const rfc = t.match(/\b[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}\b/)?.[0];
    // OCR confunde 0/O y 1/I/L: corrige solo las posiciones del CURP que siempre son dígitos (y la 17 si leyó «O»)
    const digit = c => ({ O: '0', I: '1', L: '1' }[c] || c);
    const curp = (t.match(/\b[A-Z]{4}[0-9OIL]{6}[HM][A-Z]{5}[A-Z0-9][0-9OIL]\b/)?.[0] || '')
      .split('').map((c, i) => (i >= 4 && i <= 9) || i === 17 ? digit(c) : i === 16 && c === 'O' ? '0' : c).join('') || undefined;
    if (rfc && rfcRE.test(rfc)) out.rfc = rfc;
    if (curp && curpRE.test(curp)) {
      out.curp = curp;
      const birth = date(curp.slice(4, 10), /\d/.test(curp[16]) ? 1900 : 2000);
      if (birth) out.nacimiento = birth;
      out.genero = curp[10] === 'H' ? 'Masculino' : 'Femenino';
      out.nacionalidad = curp.slice(11, 13) === 'NE' ? 'Extranjera' : 'Mexicana';
    }
  }
  const labels = ['RFC', 'CURP', 'Nombre (s)', 'Primer Apellido', 'Segundo Apellido', 'Código Postal', 'Tipo de Vialidad', 'Nombre de Vialidad', 'Número Exterior', 'Número Interior', 'Nombre de la Colonia', 'Nombre del Municipio o Demarcación Territorial', 'Nombre de la Localidad', 'Nombre de la Entidad Federativa', 'Entre Calle', 'Y Calle', 'Estatus en el padrón', 'Fecha de inicio de operaciones', 'Fecha de último cambio de estado', 'Nombre Comercial', 'Actividades Económicas', 'Regímenes', 'Obligaciones'];
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function satValue(text, label) {
    const t = norm(text), pattern = escape(norm(label)).replace(/ /g, '\\s*');
    const start = new RegExp(pattern + '\\s*:\\s*').exec(t);
    if (!start) return '';
    const rest = text.slice(start.index + start[0].length);
    const boundary = new RegExp('(?:' + labels.map(l => escape(norm(l)).replace(/ /g, '\\s*')).join('|') + ')\\s*:|ACTIVIDADES\\s+ECONOMICAS|REGIMENES|OBLIGACIONES');
    const end = boundary.exec(norm(rest));
    return clean(rest.slice(0, end ? end.index : rest.length));
  }
  function parseCSFText(text) {
    const out = {}; identity(text, out);
    const get = label => satValue(text, label);
    const name = ['Nombre (s)', 'Primer Apellido', 'Segundo Apellido'].map(get);
    if (name[0] && name[1]) out.nombre = clean(name.join(' '));
    const mapping = { cp: 'Código Postal', interior: 'Número Interior', colonia: 'Nombre de la Colonia', municipio: 'Nombre del Municipio o Demarcación Territorial', ciudad: 'Nombre de la Localidad', estado: 'Nombre de la Entidad Federativa' };
    for (const [k, l] of Object.entries(mapping)) { const v = get(l); if (v && (k !== 'cp' || /^\d{5}$/.test(v))) out[k] = v; }
    if (get('Nombre de Vialidad')) out.calle = clean(['Tipo de Vialidad', 'Nombre de Vialidad', 'Número Exterior'].map(get).join(' '));
    const table = text.split(/Actividades\s+Econ[oó]micas/i)[1]?.split(/Reg[ií]menes|Obligaciones/i)[0] || '';
    const activities = [];
    const re = /(?:^|\n)\s*(\d+)\s+([^\n]+?)\s+(\d{1,3}(?:[.,]\d+)?)\s*%?(?=\s|$)/g;
    let m;
    while ((m = re.exec(table))) activities.push({ order: +m[1], value: clean(m[2]), pct: +m[3].replace(',', '.') });
    activities.sort((a, b) => b.pct - a.pct || a.order - b.order);
    if (activities[0]) out.giro = activities[0].value;
    return out;
  }
  function parseAddressText(text) {
    const out = {}, lines = String(text).split(/\n/).map(clean).filter(Boolean);
    const cp = norm(text).match(/\bC\.?\s*P\.?\s*:?\s*(\d{5})\b/);
    if (cp) out.cp = cp[1];
    for (const line of lines) {
      if (/^(CALLE|AV\.?|AVENIDA|BLVD\.?|BOULEVARD|PRIVADA|CERRADA|CALZADA)\s+.+\s+\d+[A-Z-]*\b/i.test(norm(line))) out.calle = line;
      const col = line.match(/^(?:COLONIA|COL\.)\s*:?\s*(.+?)(?:\s+C\.?\s*P\.?\s*:?\s*\d{5}|$)/i);
      if (col) out.colonia = clean(col[1]);
    }
    return out;
  }
  function parseINEText(text) {
    const out = {}; identity(text, out);
    const lines = norm(text).split(/\n/).map(clean).filter(Boolean);
    const mrz = lines.findIndex(l => /^IDMEX/.test(l.replace(/ /g, '')));
    if (mrz >= 0) {
      const second = (lines[mrz + 1] || '').replace(/ /g, '');
      const birth = second.match(/^(\d{6})\d([HMF<])/);
      if (birth) {
        const yy = +birth[1].slice(0, 2), now = new Date().getFullYear() % 100;
        const d = date(birth[1], yy <= now ? 2000 : 1900);
        if (d) out.nacimiento = d;
        if (birth[2] !== '<') out.genero = /[HF]/.test(birth[2]) ? (birth[2] === 'F' ? 'Femenino' : 'Masculino') : 'Femenino';
      }
      const name = lines[mrz + 2] || '';
      if (/^[A-Z< ]+<<[A-Z< ]+$/.test(name)) {
        const parts = name.split('<<');
        out.nombre = clean((parts[1] + ' ' + parts[0]).replace(/</g, ' '));
      }
    } else {
      const block = String(text).match(/\bNOMBRE\s*:?\s*\n([\s\S]+?)(?=DOMICILIO|CURP|CLAVE DE ELECTOR|FECHA DE NACIMIENTO)/i)?.[1];
      if (block) { const names = block.split('\n').map(clean).filter(Boolean); if (names.length >= 3) out.nombre = clean([...names.slice(2), ...names.slice(0, 2)].join(' ')); }
      const birth = String(text).match(/FECHA\s+DE\s+NACIMIENTO\s*:?\s*(\d{2})[\/ -](\d{2})[\/ -](\d{4})/i);
      if (birth && date(birth[3].slice(2) + birth[2] + birth[1], +birth[3].slice(0, 2) * 100)) out.nacimiento = `${birth[1]}/${birth[2]}/${birth[3]}`;
      const address = String(text).match(/DOMICILIO\s*:?\s*\n([\s\S]+?)(?=CURP|CLAVE DE ELECTOR|FECHA DE NACIMIENTO|$)/i)?.[1];
      if (address) {
        Object.assign(out, parseAddressText(address));
        const addressLines = address.split('\n').map(clean).filter(Boolean);
        const postalLine = addressLines.find(l => /\b\d{5}\b/.test(l));
        if (postalLine && addressLines[0] !== postalLine && /\s\d+[A-Z-]*\b/.test(norm(addressLines[0]))) {
          out.calle = addressLines[0]; out.cp = postalLine.match(/\b\d{5}\b/)[0];
          const colony = clean(postalLine.replace(/\b\d{5}\b/, '').replace(/^(?:COLONIA|COL\.)\s*/i, ''));
          if (colony) out.colonia = colony;
        }
      }
    }
    return out;
  }
  const base = new URL('.', document.currentScript.src);
  const local = p => new URL('vendor/' + p, base).href;
  let pdfPromise, ocrPromise, area, generation = 0;
  const activeWorkers = new Set();
  const proposals = new Map();
  function pdfLibrary() {
    return pdfPromise ||= import(local('pdfjs/pdf.min.mjs')).then(lib => { lib.GlobalWorkerOptions.workerSrc = local('pdfjs/pdf.worker.min.mjs'); return lib; });
  }
  function ocrLibrary() {
    if (!ocrPromise) ocrPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = local('tesseract/tesseract.min.js');
      script.onload = () => resolve(window.Tesseract); script.onerror = () => { ocrPromise = null; reject(new Error('Lectura no disponible')); }; document.head.append(script);
    });
    return ocrPromise;
  }
  async function ocr(canvas, progress) {
    const lib = await ocrLibrary();
    const worker = await lib.createWorker('spa', 1, { workerPath: local('tesseract/worker.min.js'), corePath: local('tesseract/core/'), langPath: local('tesseract/lang/'), gzip: true, cacheMethod: 'none', workerBlobURL: false, logger: m => { if (m.progress != null) progress(Math.round(m.progress * 100)); } });
    activeWorkers.add(worker);
    try { return (await worker.recognize(canvas)).data.text; }
    finally { activeWorkers.delete(worker); await worker.terminate(); }
  }
  function canvasFor(source, width, height) {
    const c = document.createElement('canvas'); c.width = 2000; c.height = Math.round(height * 2000 / width);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.filter = 'grayscale(1)'; ctx.drawImage(source, 0, 0, c.width, c.height); return c;
  }
  async function read(file, progress) {
    if (file.size > 30 * 1024 * 1024) throw new Error('Archivo demasiado grande');
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      const lib = await pdfLibrary();
      const task = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, useSystemFonts: true });
      let canvas;
      try {
        const pdf = await task.promise; let text = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i), content = await page.getTextContent();
          let y;
          for (const item of content.items) { if (y != null && Math.abs(item.transform[5] - y) > 3) text += '\n'; text += item.str + (item.hasEOL ? '\n' : ' '); y = item.transform[5]; }
          text += '\n'; page.cleanup(); progress(Math.round(i / Math.min(pdf.numPages, 10) * 100));
        }
        if (text.trim().length >= 20) return text;
        const page = await pdf.getPage(1), v = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 2000 / v.width }); canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const gray = canvasFor(canvas, canvas.width, canvas.height);
        try { return await ocr(gray, progress); } finally { gray.width = gray.height = 0; }
      } finally { if (canvas) canvas.width = canvas.height = 0; await task.destroy(); }
    }
    const url = URL.createObjectURL(file); let canvas;
    try {
      const image = new Image(); image.src = url; await image.decode();
      canvas = canvasFor(image, image.naturalWidth, image.naturalHeight); return await ocr(canvas, progress);
    } finally { URL.revokeObjectURL(url); if (canvas) canvas.width = canvas.height = 0; }
  }
  function el(tag, text) { const e = document.createElement(tag); if (text) e.textContent = text; return e; }
  function refresh() {
    const panel = area.querySelector('.fd-results'); panel.replaceChildren();
    if (!proposals.size) return;
    panel.append(el('h3', 'Esto encontramos'));
    for (const [source, data] of proposals) {
      panel.append(el('h4', data.label));
      for (const [key, value] of Object.entries(data.fields)) {
        const row = el('label'), check = el('input'); check.type = 'checkbox'; check.dataset.key = key; check.dataset.source = source;
        const current = window.GaFicha.read(key);
        const higher = source !== 'sat' && ['nombre', 'rfc', 'curp'].includes(key) && proposals.get('sat')?.fields[key];
        check.checked = (!current || current === value) && !higher;
        row.append(check, el('span', value + ' → ' + window.GaFicha.label(key) + (current && current !== value ? ' · Actual: ' + current : '') + (higher ? ' · Prioridad: constancia fiscal' : '')));
        check.onchange = () => { if (check.checked) panel.querySelectorAll('input').forEach(other => { if (other !== check && other.dataset.key === key) other.checked = false; }); };
        panel.append(row);
      }
    }
    // Una sola propuesta seleccionada por campo, incluso entre domicilios.
    const selected = new Set(); panel.querySelectorAll('input').forEach(c => { if (c.checked && selected.has(c.dataset.key)) c.checked = false; if (c.checked) selected.add(c.dataset.key); });
    const apply = el('button', 'Pasar a la ficha'); apply.type = 'button'; apply.onclick = () => {
      const patch = {};
      panel.querySelectorAll('input:checked').forEach(c => { patch[c.dataset.key] = proposals.get(c.dataset.source).fields[c.dataset.key]; });
      window.GaFicha.applyDocument(patch); proposals.clear(); panel.replaceChildren();
    }; panel.append(apply);
  }
  function mount(root) {
    if (area) return;
    area = el('section'); area.className = 'fd-area'; area.setAttribute('aria-label', 'Subir documentos');
    const details = el('details'); details.append(el('summary', 'Subir documentos'));
    area.append(el('small', 'Los documentos se leen en esta computadora; no se envían a internet ni se guardan.'), details);
    const zones = el('div'); zones.className = 'fd-zones'; details.append(zones);
    for (const [source, label, parser] of [['sat', 'Constancia fiscal (SAT)', parseCSFText], ['ine', 'INE', parseINEText], ['address', 'Comprobante de domicilio', parseAddressText]]) {
      const zone = el('div'), button = el('button', label), input = el('input'), status = el('p');
      button.type = 'button'; input.type = 'file'; input.accept = source === 'sat' ? '.pdf,application/pdf' : '.pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf'; input.hidden = true; input.id = 'fd-' + source;
      status.setAttribute('role', 'status'); button.onclick = () => input.click();
      async function handle(file) {
        if (!file || button.disabled) return;
        const token = generation; button.disabled = true; proposals.delete(source); refresh();
        const name = file.name; status.textContent = name + ' · Leyendo…';
        try {
          const fields = parser(await read(file, n => { if (token === generation) status.textContent = name + ' · Leyendo… ' + n + ' %'; }));
          if (token !== generation) return;
          const count = Object.keys(fields).length;
          status.textContent = count ? name + ' · ✓ ' + count + ' datos encontrados' : 'No pudimos leerlo bien: escríbelo a mano o intenta con una foto más clara';
          if (count) proposals.set(source, { label, fields }); refresh();
        } catch (_) { if (token === generation) status.textContent = 'No pudimos leerlo bien: escríbelo a mano o intenta con una foto más clara'; }
        finally { file = null; input.value = ''; button.disabled = false; }
      }
      input.onchange = () => handle(input.files[0]);
      zone.ondragover = e => { e.preventDefault(); };
      zone.ondrop = e => { e.preventDefault(); handle(e.dataTransfer.files[0]); };
      zone.append(button, input, status); zones.append(zone);
    }
    const results = el('div'); results.className = 'fd-results'; details.append(results);
    root.querySelector('.fa-form').prepend(area);
  }
  function clear() { generation++; proposals.clear(); activeWorkers.forEach(w => { w.terminate().catch(() => {}); }); activeWorkers.clear(); if (area) { area.remove(); area = null; } }
  window.GaFichaDocs = { parseCSFText, parseINEText, parseAddressText, mount, clear };
})();
