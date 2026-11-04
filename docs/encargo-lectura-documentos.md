CONTEXTO
garba-advisor es la herramienta que Christian Garba, asesor Allianz, comparte EN VIVO por Google Meet; las llamadas se graban con Fathom.
Ya existe la «Ficha de alta — OptiMaxx Plus» (ficha-alta.js / ficha-alta.css, window.GaFicha), con 10 secciones, borrador local y PDF.
Trabajas en la rama main del repo (HEAD abc44e9). Haz cambios sólo en el árbol de trabajo (sin commit).

OBJETIVO
En la ficha de alta, subir documentos del cliente y llenar los campos automáticamente:
1. Constancia de Situación Fiscal del SAT (PDF): FUENTE PRINCIPAL.
2. INE (foto JPG/PNG/HEIC convertida por el navegador, o PDF escaneado): frente y/o reverso.
3. Comprobante de domicilio (PDF con texto o foto).

REGLAS DURAS (privacidad: datos personales sensibles)
- TODO se procesa dentro del navegador. Prohibido enviar documentos o texto extraído a cualquier servicio externo, API o IA. Sin fetch/XHR con el contenido.
- Usa SOLO las librerías ya copiadas en vendor/ (ver vendor/README.txt):
  - vendor/pdfjs/pdf.min.mjs y pdf.worker.min.mjs: texto de PDFs;
  - vendor/tesseract/tesseract.min.js, worker.min.js, core/ y lang/spa.traineddata.gz: lectura de imágenes.
  - Configura tesseract con workerPath, corePath y langPath locales y gzip:true. No uses CDNs.
- Carga diferida: las librerías se cargan sólo cuando se sube el primer documento (import() dinámico / <script> inyectado), nunca al abrir la herramienta.
- Los archivos y el texto extraído viven sólo en memoria: nada en localStorage, sessionStorage, IndexedDB ni en la sesión. Al terminar, se liberan (URL.revokeObjectURL, terminate del worker).
- No mostrar vista previa del documento (la pantalla se comparte y se graba). Sólo el nombre del archivo y el resultado por campo.
- NUNCA sobrescribas en silencio: tras leer, muestra un panel «Esto encontramos» con cada campo detectado (valor leído → campo de la ficha), con casilla marcada por defecto, y el botón «Pasar a la ficha».
  - Si el campo ya tiene un valor distinto, la casilla aparece DESMARCADA y se muestra «Actual: X».
  - Los valores siempre se pueden corregir a mano después.
- No cambies fórmulas financieras (tests/projection-static.cjs exige fuente idéntica), no rompas `?flujo=clasico`, no borres funciones. Estilos sólo bajo #gaFicha.
- Todo texto visible en español.

UI
- En la ficha, arriba de la sección 1 (o como barra fija dentro de #gaFicha, sobre las secciones): «Subir documentos» con tres botones:
  - «Constancia fiscal (SAT)»
  - «INE»
  - «Comprobante de domicilio»
  Cada botón acepta archivo (input type=file), y también soltar archivos sobre la zona.
- Estado por documento:
  - «Leyendo…» con avance (tesseract da progreso);
  - luego «✓ N datos encontrados»;
  - o «No pudimos leerlo bien: escríbelo a mano o intenta con una foto más clara».
- Aviso fijo y chico: «Los documentos se leen en esta computadora; no se envían a internet ni se guardan.»

EXTRACCIÓN
A. Constancia de Situación Fiscal (texto del PDF con pdf.js; si el PDF no trae texto, recurre a OCR de la página 1).
   Etiquetas típicas del SAT (tolera mayúsculas/minúsculas, acentos y saltos de línea):
   - «RFC:» → rfc (12 o 13 caracteres, con homoclave)
   - «CURP:» → curp (18)
   - «Nombre (s):» + «Primer Apellido:» + «Segundo Apellido:» → nombre completo
   - «Código Postal:» → codigoPostal
   - «Tipo de Vialidad:» + «Nombre de Vialidad:» + «Número Exterior:» → calle y número exterior (ej. «CALLE REFORMA 123»)
   - «Número Interior:» → numeroInterior
   - «Nombre de la Colonia:» → colonia
   - «Nombre del Municipio o Demarcación Territorial:» → municipio
   - «Nombre de la Localidad:» → ciudad
   - «Nombre de la Entidad Federativa:» → estado
   - Tabla «Actividades Económicas» → giro (la actividad con mayor porcentaje u orden 1)
   - Del CURP se derivan:
     - fecha de nacimiento: posiciones 5–10 AAMMDD. Siglo: si el carácter 17 es dígito → 1900, si es letra → 2000. Formato DD/MM/AAAA.
     - género: posición 11 H/M → Masculino / Femenino.
     - nacionalidad: entidad (posiciones 12–13) «NE» → «Extranjera»; si no, «Mexicana».
B. INE
   - Reverso: zona de lectura mecánica (3 líneas tipo «IDMEX…», línea 2 con fecha de nacimiento AAMMDD y sexo, línea 3 «APELLIDO1<APELLIDO2<<NOMBRES»). Normaliza «<» a espacios.
   - Frente: «NOMBRE» (líneas siguientes), «DOMICILIO» (2–3 líneas: calle y número / colonia y CP / municipio y estado), «CURP», «FECHA DE NACIMIENTO».
   - Preprocesa la imagen antes de leerla: escala de grises y escalado a ~2000 px de ancho, en un canvas en memoria.
C. Comprobante de domicilio: texto (pdf.js) o OCR. Busca el código postal (C.P. + 5 dígitos), la línea de calle y número y la colonia. Asigna domicilio sólo con confianza razonable. Si no hay certeza, deja el campo sin marcar.
- Validaciones: RFC con regex de persona física `^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$`, CURP con regex oficial, CP de 5 dígitos. Lo que no valide no se propone, o se propone desmarcado con «revisar».
- Prioridad si hay conflicto: constancia > INE > comprobante para RFC, CURP y nombre. Para domicilio, el panel muestra ambos y Christian elige.

ARCHIVOS
- Nuevo: ficha-docs.js (cargado después de ficha-alta.js en index.html). Expón window.GaFichaDocs = { parseCSFText, parseINEText, parseAddressText } (funciones puras, para pruebas).
- Ajustes mínimos en ficha-alta.js, sólo si hace falta un punto de enganche: por ejemplo, exponer en GaFicha una función para leer y escribir valores de campos por clave, que re-renderice y guarde el borrador. Respeta la regla: tarjeta y CLABE nunca se guardan.

PRUEBAS (el sandbox no corre Chromium; Claude las corre)
- tests/ficha-docs-checks.cjs, llamado desde tests/presentation.cjs después de ficha-checks:
  - textos sintéticos (inventa una constancia ficticia: «JUAN PÉREZ LÓPEZ», RFC PELJ800101AB1, CURP PELJ800101HDFRPN09 y domicilio ficticio):
    - parseCSFText devuelve RFC, CURP, nombre, domicilio, giro, fecha 01/01/1980, género Masculino y nacionalidad Mexicana;
    - una MRZ ficticia del INE da nombre y fecha;
  - en la página: inyectar un PDF sintético generado en la prueba con jsPDF, que ya trae index.html, con ese texto en el input de la constancia, y comprobar:
    - que aparece el panel «Esto encontramos»;
    - que «Pasar a la ficha» llena los campos;
    - que un campo con valor previo distinto aparece desmarcado;
  - que no hubo peticiones de red salvo archivos locales de vendor/ (page.on('request') sólo del mismo origen);
  - que nada del documento queda en localStorage ni sessionStorage.
- `node --check` en todo .js tocado.

ENTREGA
- Cambios en el árbol de trabajo (vendor/ ya está, no lo modifiques).
- docs/lectura-documentos-reporte.md:
  - qué hiciste;
  - precisión esperada por documento;
  - qué no se pudo;
  - cómo revertir.
  Termina con la línea «FIN».
