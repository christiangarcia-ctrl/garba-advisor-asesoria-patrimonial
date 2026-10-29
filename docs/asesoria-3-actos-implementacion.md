# GarBa Advisor — implementación del recorrido de tres actos

**Rama:** `asesoria-3-actos` (sin merge ni publicación).  
**Base:** `main` @ `f726141b2eaf53d42a424d215c46d2f460d5a487`.  
**Alcance:** interfaz y navegación. No se han editado fórmulas financieras, textos legales ni datos de acreditación.

## A–I: estado de implementación

| Bloque | Estado del código | Comprobación pendiente |
|---|---|---|
| A. Tres actos | Implementado: omite escena 1 en modo nuevo; diagnóstico 2–7 intacto; 7 lleva a la calculadora; interruptor clásico privado en panel y `?flujo=clasico` | Recorrido de una sesión real y restauración de datos |
| B. Su número | Implementado: aportación sostenible primero, `fondo65`, lectura fiscal existente, tarjetas de aportación con llamadas a `calcAccum()` y restauración de estado, objetivo/gráfica/tablas plegados | Comparar 7 escenarios con ADVISOR_BASELINE; revisar side effects de recálculo |
| C. Decisión | Implementado: hoy, agendar, ajustar, pensar; siete motivos, campo «Otra», fecha/hora obligatorias o excepción explícita; sesión y PDF de segunda cita | Pruebas completas de cada motivo y PDF descargado |
| D. Esperar un año | Implementado mediante `calcAccum()` con edad inicial +1 y aportación idéntica, restaurando el escenario original | Comprobar casos límite con edad próxima a 65 |
| E. Biblioteca | Implementado: preguntas, relevancia desde `buildSlides`, contenido original de recursos, Art. 151/93 filtrados visualmente, sin imágenes nuevas | Validación del texto visible en móvil y retorno de foco |
| F. Panel del asesor | Implementado: ventana independiente, BroadcastChannel y fallback localStorage, fases y cronómetros, diagnóstico y mensajes [REVISAR CHRISTIAN]. Interruptor clásico solo en panel | Probar popup bloqueado, reapertura y sincronización entre pestañas |
| G. Resumen WhatsApp | Implementado: copiar sin enviar, datos de escenario, fiscal cuando está disponible, siguiente paso y fecha | Probar portapapeles con permisos del navegador |
| H. Modo celular | Implementado: cuatro pantallas grandes, decisiones originales reutilizadas, sin gráficas y tablas, modo recordado en sesión | Captura de 1440×900 escalada a 390 px y legibilidad real en Meet |
| I. /asesor/ | Implementado: perfil móvil, foto y QR originales, datos de acreditación sin alteraciones, expectativas de la asesoría | Captura real a 390 px y prueba de recursos |

**Hecho distinto:** los cambios se registraron como commits incrementales de implementación y correcciones, no como exactamente nueve commits consolidados. La rama está aislada y no requiere alterar `main` para revisar.

## Integridad de código y pruebas

- **Verificado:** los 15 scripts inline de `index.html` y los scripts de `three-acts.js`, `advisor-panel.html` y `tests/presentation.cjs` pasan validación de sintaxis JavaScript.
- **Verificado:** `main` no fue modificado; el comparativo muestra cinco archivos modificados o agregados.
- **Pendiente de ejecutar:** `node tests/presentation.cjs` antes/después. El contenedor actual no puede resolver GitHub (fallo DNS), y no tiene instalado Playwright; no se deben interpretar como ejecutados los nuevos tests.
- **Pendiente:** `ADVISOR_BASELINE` y comparación automatizada de cifras financieras.
- **Pendiente:** pruebas funcionales y capturas; no se han generado screenshots.

## Capturas previstas

Al ejecutar `node tests/presentation.cjs`, `ADVISOR_TEST_OUTPUT` controla el directorio de salida. Incluye capturas históricas del flujo clásico (por ejemplo, `intro-desktop.png`, `resources-desktop.png`, `calculator-desktop.png`) y nuevas:
- `three-acts-diagnosis.png`
- `three-acts-desktop.png`
- `three-acts-projected-mobile.png`
- `three-acts-think-partner.png`
- `three-acts-second-appointment.png`
- `advisor-private-panel.png`
- `advisor-profile-390.png`

Para el informe visual definitivo se deben comparar capturas del mismo estado de datos, antes y después, pantalla por pantalla. **No está hecho todavía.**

## [REVISAR CHRISTIAN]

1. Siete respuestas breves a «Necesito pensarlo» en la ventana privada.
2. Si los mensajes de microcopia y el lenguaje de «costo de esperar un año» son adecuados para la venta consultiva.
3. Legibilidad y ritmo de cada pantalla móvil.
4. Que la biblioteca ofrezca suficiente evidencia para preguntas sobre pausas y flexibilidad usando únicamente contenido original.

## [PENDIENTE CHRISTIAN]

1. Validación visual en Google Meet con la pestaña compartida, tanto en escritorio como en móvil.
2. Confirmación de las nuevas rutas en una asesoría ficticia completa y revisión del PDF.
3. Confirmación de resultados financieros usando el baseline de la versión de partida.

## Reversión y publicación

No se ha publicado. La versión en `main` permanece intacta. En la rama de trabajo se puede acceder al recorrido anterior con `?flujo=clasico` o desde el panel privado, sin recargar y sin eliminar la sesión. La reversión de despliegue consiste simplemente en no fusionar `asesoria-3-actos`; si se rechaza, eliminar o archivar solo esa rama.

## Revisión final externa

El usuario solicitará personalmente la revisión a **Claude Code**. No se invocó Claude ni ningún otro modelo como parte de esta implementación. La revisión debe comenzar ejecutando el test, corrigiendo fallas detectadas y comprobando que no hay diferencia financiera ni visual indebida antes de aprobar un merge.


## Validación estática adicional — 28 oct 2026

**Aprobado, con evidencia de comparación directa:** cuatro rutinas financieras de `index.html` son byte por byte iguales en `main` y `asesoria-3-actos`: `calcularPMTRequerido`, `updateSuggestion`, `calcAccum` y `pmtParaFondo65`. Esto prueba que no se alteró el código de esas fórmulas, **no** que los escenarios de interfaz produzcan exactamente los mismos valores al ejecutarse.

**Aprobado:** sintaxis JavaScript de `three-acts.js`, `advisor-panel.html` y `tests/presentation.cjs`.

**Corregido durante revisión:** el índice fiscal de Biblioteca ahora espera a que la lámina termine su renderizado antes de filtrar Art. 151 o Art. 93 (commit `64a3208`).

**Bloqueado:** no se ejecutó Playwright ni se generaron screenshots; el entorno tiene Chromium, pero no el módulo Playwright y no resuelve `github.com` para clonar la rama. La suite deberá ejecutarse en el repositorio local con Playwright ya instalado antes de aprobar la publicación.

**Veredicto:** validación estática parcial. **No aprobado para producción aún.** Aún deben verificarse navegación real, restauración exacta del flujo clásico, vistas de Google Meet, PDF, panel separado y comparación financiera `ADVISOR_BASELINE`.


## Validación automatizada aprobada — 29 octubre 2026

**Ejecución:** https://github.com/christiangarcia-ctrl/garba-advisor-asesoria-patrimonial/actions/runs/40834249195

**Commit validado:** `875edf0dfe5272ffca0cc9ce3d54391ae58e3af7`.

**Resultado:** GitHub Actions `success` (Playwright Chromium), incluyendo baseline de `main`. El registro confirma: “PASS: 7 financial scenarios match the original, including report and both detail tables” y “PASS: full-width advisory, full-screen resources, keyboard return, live input/results/chart, stale-output protection, fixed controls, result tabs, responsive layouts”. También se ejecutaron los casos nuevos insertados en `tests/presentation.cjs` antes de la aserción final.

**Evidencia visual:** artifact `garba-advisor-validation` (32 archivos), disponible en la ejecución de Actions. No se ha efectuado todavía revisión humana individual de las capturas antes/después ni una sesión real de Meet.

**Correcciones efectuadas durante las ejecuciones:** superposición del botón del asesor, control de salida del modo celular en pruebas, ubicación visible del Acto 3, doble comando BroadcastChannel/localStorage y resolución de `/asesor/` en el servidor de tests.

**Cobertura pendiente:** pruebas separadas para las siete razones de `think`, descarga e inspección del PDF real con fecha, verificación de legibilidad a 390px de la proyección compartida a 1440px y revisión visual detallada de todas las capturas. No atribuir a la prueba aprobada una cobertura que todavía no tiene.

**Publicación:** ninguna. Aún sin merge a `main`.


## Cierre de validación automatizada — 29/10/2026

**Resultado final: PASS.** Ejecución: https://github.com/christiangarcia-ctrl/garba-advisor-asesoria-patrimonial/actions/runs/40835110622

Commit de código probado: `2ccb93416925a0584e73b50d2ec450c823c1201a`.

Las 7 comparaciones financieras con `main` fueron idénticas, incluyendo tablas y reporte. Pasaron el recorrido clásico y el de tres actos, modo celular, panel privado, retorno sin pérdida de datos, navegación de recursos y pantalla de perfil de asesor. También se ejecutaron los 7 motivos distintos de «Necesito pensarlo», fecha/hora, salida «sin fecha», y descarga de un PDF real (`%PDF`) verificando que el texto enviado a jsPDF contenga el motivo y la fecha acordada.

**Archivos:** GitHub Actions adjuntó 35 evidencias, incluidas capturas de pantalla y el PDF sintético de segunda cita en `garba-advisor-validation`. Las pruebas son automatizadas sobre datos ficticios; no sustituyen una revisión de diseño humano con el prospecto en Google Meet. Los archivos se guardaron y su generación se verificó, pero no se realizó una inspección visual manual individual de cada captura en esta sesión.

**Seguridad de publicación:** `main` y GitHub Pages intactos; no se hizo merge ni despliegue. El usuario solicitará personalmente la revisión final a Claude Code. **Se puede entregar para esa revisión**, no para publicar sin aprobar la revisión.
