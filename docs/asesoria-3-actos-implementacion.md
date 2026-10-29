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
