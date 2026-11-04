# Ficha de alta — OptiMaxx Plus Allianz

## Resumen
Implementación sobre la rama `ficha-alta` del repositorio `garba-advisor-asesoria-patrimonial`, aislada de la herramienta pública de `main`.

## Qué se implementó
- Módulo `ficha-alta.js` y `ficha-alta.css`, cargados después de `lienzo.js`.
- «Iniciar captura» como primera opción del menú del lienzo y entrada desde «Iniciar hoy» en el Acto 3, conservando la decisión existente.
- Vista de pantalla completa con 10 secciones, navegación, avance por sección y general, ingreso secuencial con Enter, navegación anterior/siguiente y regreso a la asesoría.
- Enlace «Abrir precaptura anterior» para conservar el flujo existente.
- Prellenado de campos vacíos desde los datos que ya existen en la asesoría, incluido Punto de Partida cuando corresponde.
- Suma en vivo de porcentajes de beneficiarios sin bloquear la captura.
- PDF confidencial con diez secciones, valores vacíos señalados, casillas y valores íntegros de los campos bancarios que el asesor decida capturar. Generación con jsPDF incluido en la herramienta; sin dependencias externas.
- Selector de carpeta con File System Access API en Chrome, handle persistido en IndexedDB; alternativa mediante descarga normal.
- Copia a portapapeles del texto de la ficha, previa decisión expresa de incluir o excluir información bancaria.

## Qué se guarda
- **Borrador no bancario:** `localStorage`, bajo `gaFichaDraft:<gaSessionKey>`, para poder recuperar la captura tras recargar la pestaña. Incluye datos personales no bancarios, elecciones del plan, documentos y validación.
- **Preferencia de carpeta:** únicamente el handle del directorio, en IndexedDB (`gaFichaStorage`); no se guardan allí datos del prospecto.
- **PDF:** se intenta guardar exclusivamente en la carpeta elegida por el usuario en su equipo o, si no es posible, descargarlo a la Mac. El PDF puede incluir el número de tarjeta, vencimiento y CLABE completos, si fueron capturados, por solicitud explícita.

## Qué no se guarda
- Número de tarjeta, vencimiento y CLABE no se escriben en `localStorage`, `sessionStorage`, IndexedDB, `data()`, `gaAdvisorSession`, `gaRecentSessions` ni en el panel del asesor.
- Esos tres valores viven únicamente en memoria durante la sesión abierta. Se pierden al recargar.
- No se envía la ficha a ningún servicio, CRM ni backend.
- No se modificó ningún código de cálculos financieros.
- `?flujo=clasico` no cambia y sigue teniendo la precaptura previa.

## Pruebas y pendientes de revisión
- Se creó `tests/ficha-checks.cjs` y se conectó a `tests/presentation.cjs` después de `lienzo-checks.cjs`.
- Se adaptó la prueba previa para comprobar la nueva ficha y la entrada a la precaptura antigua.
- Se verificó sintaxis de JavaScript con el parser de V8 para los archivos nuevos y modificados. **No se ejecutó `node --check` como proceso de Node ni Playwright en el entorno de ejecución**, de modo que ambos quedan pendientes de la revisión de Claude.
- Claude debe revisar la visibilidad y el avance de las 10 secciones, responsividad 1440×780 y móvil, persistencia selectiva del borrador, recarga sin campos bancarios, PDF descargado con nombre correcto, permisos de carpeta en Chrome/Mac, salida al acto correspondiente, compatibilidad con `?flujo=clasico`, pruebas de proyección y seguridad de manejo de PDF.
- No se ha publicado la ficha en GitHub Pages. No hacer merge sin autorización expresa de Christian.
- **Precaución:** el PDF contiene información sensible si se capturan datos bancarios: conservarlo en una carpeta segura, no compartirlo y eliminarlo después de capturarlo en Allianz.

## Archivos afectados
- Nuevos: `ficha-alta.js`, `ficha-alta.css`, `tests/ficha-checks.cjs`, `docs/ficha-alta-reporte.md`.
- Modificados: `index.html`, `lienzo.js`, `lienzo.css`, `tests/lienzo-checks.cjs`, `tests/presentation.cjs`.
- Sin cambios: fórmulas financieras, cálculos, lógica de sesión, la rama `main`.

## Cómo revertir
- **Antes de publicar:** cerrar el Pull Request sin fusionar y no usar la rama `ficha-alta`. `main` seguirá intacta.
- **Si se fusionara posteriormente:** revertir exclusivamente el commit del PR desde GitHub (`git revert <sha-del-merge>`) y publicar el revert. No se necesita borrar datos de clientes en un servidor, porque la ficha no se transmite.
- Los borradores locales se pueden borrar quitando las claves `gaFichaDraft:` del almacenamiento local del navegador, si fuera necesario.

FIN
