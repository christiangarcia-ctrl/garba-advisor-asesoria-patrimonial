# Lectura local de documentos

Se agregó ficha-docs.js después de ficha-alta.js, con lectores puros expuestos en GaFichaDocs. La ficha incluye una zona desplegable «Subir documentos» con tres botones y recepción de archivos arrastrados. No hay vistas previas. Cada lectura muestra progreso y una revisión «Esto encontramos», con selección individual y aplicación explícita. Los conflictos con valores existentes quedan desmarcados; la constancia tiene prioridad para identidad y los domicilios conservan su fuente. Sólo se selecciona una propuesta por campo.

PDF.js y Tesseract se cargan al necesitarse, desde vendor. Los PDF con texto se leen hasta diez páginas; los escaneados recurren a OCR de la primera página. Las imágenes pasan por un canvas en gris de 2000 píxeles de ancho. Tesseract usa rutas locales, gzip y cacheMethod none, sin caché de idioma en IndexedDB. No se incorporaron llamadas a servicios ni envíos de contenido.

Los archivos, texto y propuestas sólo viven en memoria. Al aplicar se descartan las propuestas; al cerrar se limpia el panel y se terminan los trabajadores activos. Se revocan las URL de imágenes, se destruyen los trabajadores PDF y se vacían los canvas. Los valores importados quedan en memoria en la ficha, excluidos del borrador local incluso si posteriormente se corrigen a mano. La exportación explícita de la ficha a PDF conserva el funcionamiento existente. Tarjeta y CLABE siguen excluidas del borrador. La eliminación de referencias permite liberar memoria; JavaScript no permite garantizar borrado físico inmediato de RAM.

## Precisión esperada

- Constancia fiscal con texto: mejor resultado cuando conserva las etiquetas SAT. Valida RFC de persona física, estructura de CURP, fechas y CP. Une nombre y domicilio; selecciona la actividad con mayor porcentaje en filas reconocibles. No se midió una tasa de acierto con documentos reales.
- INE: reconoce MRZ de tres líneas y bloques del frente. La calidad del OCR depende de enfoque, iluminación y orientación. La MRZ sólo ofrece dos dígitos de año: se usa el año actual como corte de siglo. Revisar siempre la fecha. Se proponen domicilios del frente cuando se reconocen líneas con número y CP.
- Comprobante: lector deliberadamente conservador; requiere CP explícito y etiquetas o prefijos reconocibles para calle y colonia. Omite municipio y estado cuando no son inequívocos.

## Límites y comprobaciones

Pasaron node --check de ficha-alta.js, ficha-docs.js y las dos pruebas modificadas/agregadas; pasaron los lectores puros con constancia y MRZ ficticias y tests/projection-static.cjs, que confirma la fuente financiera intacta.

Se agregó tests/ficha-docs-checks.cjs a tests/presentation.cjs después de ficha-checks. Incluye PDF generado en memoria con jsPDF, revisión, aplicación, conflicto desmarcado y comprobaciones de solicitudes y almacenamiento. La ejecución con Chromium queda pendiente para Claude conforme al encargo; no se afirma validación visual ni OCR real ejecutado en este entorno.

HEIC sólo funciona si el navegador puede decodificarlo nativamente; si no, se muestra el mensaje de lectura fallida. No se agregó un conversor externo. No se garantiza extracción de tablas SAT con columnas desordenadas, PDF protegidos, documentos rotados o plantillas no reconocidas. No se modificó vendor ni se usó IA adicional. El flujo clásico conserva su exclusión de la ficha.

## Cómo revertir

Retirar la referencia a ficha-docs.js de index.html y su llamada en tests/presentation.cjs; retirar los bloques añadidos al final de ficha-alta.css y los enganches de lectura en ficha-alta.js. Eliminar ficha-docs.js, tests/ficha-docs-checks.cjs y este reporte. Revisar el diff antes de revertir para conservar cualquier cambio posterior de otras sesiones. No borrar vendor ni docs/encargo-lectura-documentos.md, que ya estaban presentes antes del trabajo.

FIN
