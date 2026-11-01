# Ronda 4 · Tu plan en vivo

Cambios en el árbol de trabajo, sin commit ni publicación. La maqueta original y sus PNG permanecen intactos. `lienzo.js` adapta su estructura, textos, pasos, animación y estilos; `lienzo.css` los limita a esta presentación.

## Estado de los puntos 1–9

1. **Hecho en código.** Bienvenida de la maqueta, credenciales que abren el modal original y enlace al importador de sesión existente. Las escenas originales se conservan.
2. **Hecho en código.** Ocho preguntas, opciones conectadas a los botones originales, respuesta libre, preocupación opcional, historia editable, resumen y confirmación mediante `setConfirmed`, `diagnosisChecks.ready` y el botón original de validación. Los atajos solicitan primero edad y aportación si faltan. Pendiente comprobar interacciones en Chromium.
3. **Hecho en código.** Porqué, cifra leída de `ingreso65`, capital, meta futura y aportación sugerida. La curva interpola los saldos anuales de `chart.data.datasets[0]`, igual que ronda 3; se fijan los puntos `fondoPlan` y `fondo65`. No utiliza el iframe ni la simulación aproximada de la maqueta. Eje vacío y dibujo inicial incluidos.
4. **Hecho en código.** Narración y controles en la izquierda; seis pasos fiscales o cinco sin beneficio fiscal, flechas y teclado, mínimo rojo, plazos hasta los 65, ingreso en el paso fiscal y reinversión para 151. Se conserva la lógica financiera original.
5. **Hecho en código; presentación distinta en el formulario de seguimiento.** Las tres opciones activan los botones originales. Los inputs de solicitud, agenda y el panel «Necesito pensarlo» se trasladan con anclas, conservando IDs y listeners. El formulario de seguimiento conserva literalmente las etiquetas y validaciones de ronda 2, incluido «Acordamos continuar sin fecha definida»; no se sustituyó por un formulario nuevo. Se ocultan las demás opciones y se permite regresar. La apertura sigue usando `gaPostCalcContinue`, incluida la ruta propia de V2 para sesiones identificadas.
6. **Hecho en código con la alternativa prevista.** Lista de dudas en la izquierda. Los recursos nativos se montan allí, con filtro fiscal; las láminas sin recurso nativo (respaldo y apertura) usan la vista original de recursos. Al cerrarla, el lienzo conserva acto y paso. La curva permanece en pantalla para los recursos nativos.
7. **Hecho en código.** Menú con las seis acciones solicitadas. Más ajustes y detalle abren la vista existente, con sus pestañas y un botón de regreso al lienzo. Modo celular apila los bloques. La pantalla principal no muestra la franja ni los botones de ronda 3, porque sus contenedores originales quedan ocultos.
8. **Hecho en CSS; validación visual pendiente.** Alto de viewport, rejilla 460 px + lienzo, scroll interno en la conversación y apilado a ≤760 px. Las pruebas exigen ausencia de scroll de página en capturas de escritorio. No se afirma que esas pruebas hayan pasado: este sandbox no ejecutó Chromium.
9. **Hecho en código.** Eliminado el texto «[REVISAR CHRISTIAN]». El emisor original del panel toma el acto del lienzo y conserva su acumulación de tiempos, prioridad, condición, barrera, monto, fiscal y motivo. Etiquetas: Tu porqué / Tu número / Tu decisión. Su comando de apertura pasa al Acto 3.

## Estado, cálculos y Punto de Partida

Única variable nueva en `reportState`: **`metaNom65`**. Se guarda el resultado local que ya existía en `calcularPMTRequerido`; no cambia su operación ni su retorno. El resto se lee de `reportState`, inputs y la gráfica existente. La capa guarda únicamente navegación (acto, pregunta, paso, duda abierta, opción visible y animación), no copias de las respuestas.

`bootKnown()` lee `window.__gaKnown` y solo completa inputs vacíos. Sesión identificada: resumen, historia y proyección. No convierte el régimen laboral `NOM/PF/INF` en un artículo fiscal: el artículo se solicita en Acto 2. Si V2 trae una sesión reanudable, conserva su escena `v2r`; la activación posterior de resultados lleva al Acto 2. La reanudación exacta de un payload V2 remoto requiere validación en navegador.

## Conexión de respuestas

| Respuesta / control | Fuente original y escritura |
| --- | --- |
| Edad | `gaAge` → eventos input/change; espejo `edad` |
| Te preocupa | click en `gaPriorityOptions [data-value]`; libre mediante `gaPriorityOtherBtn` + `gaPriorityOther`; conserva `GaShell.priorities` |
| Preocupación opcional | `gaPriorityWhy`, eventos input/change |
| Quieres | click en presets de `gaWhy`; libre en `gaWhy` |
| Por qué ahora | click en presets de `gaMeaning`; libre en `gaMeaning` |
| Condición | click en presets de `gaConcern`; libre en `gaConcern` |
| Barrera | click en presets de `gaBarrier`; libre en `gaBarrier` |
| Meta de hoy | `gaGoal` y `metaHoy`, eventos originales |
| Aportación | `gaPmt` y `pmt`, eventos originales (incluido userEditedPMT) |
| Plazo | `years`, eventos originales; opciones 10/15/20/25 que terminen hasta los 65 |
| Régimen | `gaTax` y `regimenFiscal`; se habilita en gaTax la opción existente «Sin beneficio fiscal» de la calculadora |
| Ingreso | `gaIngresoMensual` y `ingresoMensualCliente`, eventos originales |
| Reinversión | `gaReinvertISR` y `reinvertISR`, checked + eventos originales |
| Agenda | mismos nodos `gaOpeningDate`, `gaOpeningTime` |
| Solicitud | mismos nodos vacíos `gaPhone`, `gaEmail`, `gaProfession`, `gaCivil`, `gaDecision` |
| Pensarlo | mismo nodo `gaThinkPanel` con todos sus controles, estado de `GaThreeActs`, resumen y validación originales |

Cada escritura agenda la persistencia original. Los nodos trasladados vuelven a su posición al cambiar de vista o regresar al clásico.

## Pruebas y capturas

Verificado aquí: `node --check` de lienzo, three-acts, advisor-v2 y scripts de pruebas; extracción de los scripts inline de index/panel para verificar sintaxis; revisión del diff financiero. No se ejecutó navegador ni se generaron capturas de producto.

`tests/presentation.cjs` mantiene los siete fixtures financieros anteriores contra `ADVISOR_BASELINE`, incluidos reporte y tablas. Se excluye de la comparación únicamente el nuevo campo de presentación `metaNom65`, además de las exclusiones anteriores. El bloque de interfaz de ronda 2/3 se sustituye por `tests/lienzo-checks.cjs`; las verificaciones clásicas anteriores permanecen.

Ejecutar con Playwright disponible:

```sh
ADVISOR_BASELINE=/ruta/al/checkout/main NODE_PATH=/ruta/a/node_modules node tests/presentation.cjs
NODE_PATH=/ruta/a/node_modules node tests/capture-lienzo.cjs
```

Las capturas van a `/tmp/advisor-ronda4-capturas` (o `ADVISOR_TEST_OUTPUT`): bienvenida, pregunta, resumen sin/con PDP, Acto 2 pasos 0/3/5 (151), paso 5 (93), pensarlo, duda y celular 390 px. Comprobar visualmente contra todos los PNG de la maqueta, especialmente tamaños, altura y legibilidad compartida por celular. Las comparaciones financieras deben ejecutarse antes de aprobar la ronda.

## Revertir

Sin descartar cambios ajenos: retirar de `index.html` el link/script de lienzo y la asignación de `metaNom65`; retirar los hooks de `GaLienzo` en `three-acts.js`; restaurar el bloque de pruebas y etiquetas del panel desde `c94d963` si se desea volver exactamente a ronda 3. Eliminar únicamente los nuevos archivos `lienzo.js`, `lienzo.css`, `tests/lienzo-checks.cjs`, `tests/capture-lienzo.cjs` y este reporte. Conservar `docs/maqueta/`, que ya estaba sin seguimiento antes de comenzar.

No se cambiaron fórmulas, supuestos, condiciones legales ni textos fiscales. No se llamó a IA adicional.

FIN

## Revisión de Claude (2026-10-31)

- `metaNom65` ya no se guarda dentro de `calcularPMTRequerido` (la prueba estática exige fuente financiera idéntica): `lienzo.js` usa la misma expresión, solo para mostrar.
- `#gaReturnLienzo` se ocultaba mal en el recorrido clásico y reducía el área de resultados: oculto con `body.ga-three-classic`.
- Reglas sin `#gaLienzo` dentro de `@media` y al final del CSS (`.stage`, `.headrow`, `.hist`, `.top`): limitadas al lienzo; se quitaron comentarios que partían selectores.
- Flechas del teclado de la ronda 3 se disparaban con el lienzo activo (error `fondo65`): se ignoran mientras el lienzo está visible.
- Menú «⋯» sin triángulo del navegador; duda abierta ensancha la columna izquierda; estilos del formulario «Necesito pensarlo».
- Pruebas: 7 escenarios financieros idénticos a main, UI clásica, lienzo, estática y panel privado: PASS.
