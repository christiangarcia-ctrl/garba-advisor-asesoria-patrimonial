# Ronda 2 — revisión para Claude Code

Base verificada: `415b4d4`, rama `asesoria-3-actos`; árbol inicialmente limpio. Cambios locales sin commit, merge, push ni publicación. No se llamó a otro agente/modelo/servicio de IA. La nota local manda sobre la entrega por commits.

| Cambio | Estado del código y diferencias |
|---|---|
| 1. Tu camino | Hecho, pendiente QA visual: SVG escalado al `fondo65` existente; curva estimada e ilustrativa determinista, inicio cero y final idéntico; sin cifras financieras de la onda. Cuatro marcadores numerados con mes/año y edad, conectados a su texto; banda de 18 meses, explicación en un valle y leyenda de Inversión. La gráfica original con meta pasa a «Tu meta y la brecha»; permanece el respaldo clásico. Interpolación exclusivamente gráfica entre puntos anuales existentes. |
| 2. Etapas dentro de calculadora | Hecho: bono literal y cinco botones con iconos existentes, abren/cierran una tarjeta en la misma vista. Textos de detalle copiados de Etapas/Bono. No se incluyó una cifra en los detalles porque no es necesaria y podría confundirse con saldo disponible. Préstamo conserva la condición completa en el botón. Costos siguen en Biblioteca; no se añadieron a la calculadora. |
| 3. Lenguaje y celular | Hecho distinto: tres cifras principales en el encabezado (aportación, fondo a los 65, ingreso mensual); supuestos plegados y nota de pesos futuros. Art. 93 mantiene referencia a Biblioteca y frase existente sobre posible exención. «Tu camino» tiene página propia dentro del modo celular: cinco páginas, para evitar amontonar cuatro hitos debajo de las cifras. Se reemplazó el contenedor móvil fijo por contenido en flujo. Legibilidad a 390 px pendiente de inspección. |
| 4. Esperar | Hecho: retirada la tarjeta D, entrada de Biblioteca y ruta a la simulación. Ruta «más adelante» solo acuerda seguimiento. Se conserva la función de cálculo existente, sin invocación de demora desde el recorrido. |
| 5. Seguimiento | Hecho: «¿Cuándo te busco?» con fecha/hora, «Para entonces ya…» de una línea, opción explícita sin fecha. Estado de sesión, exportación de sesión existente, PDF de segunda cita y resumen para copiar por WhatsApp. No se envían mensajes. |
| 6. Panel privado | Hecho, pendiente prueba real entre ventanas: avisos a los 12 minutos para actos 1 y 2, botón «Preguntó por el trámite», señal destacada y acceso a decisiones/apertura en principal por el canal existente (fallback localStorage). No se añade coaching a la pestaña compartida. |
| 7. Biblioteca | Hecho: flexibilidad primero aun al marcar respuestas relevantes. Etapas, Inversión y Costos conservados. |

## Evidencia y pruebas

Salida de `node tests/projection-static.cjs`:

> PASS: display scale/endpoints, deterministic nonnegative wave, 4 dated milestones for 2 ages, 5 inline toggles; 4 financial routines byte-identical to main. Financial browser scenarios pending.

Salida conservada en `docs/ronda2-evidencia/validacion-estatica.txt`. Pasaron `node --check` en `projection-path.js`, `presentation.js`, `calculator-layout.js`, `three-acts.js`, `tests/presentation.cjs` y `tests/projection-static.cjs`; también los nueve scripts inline de `index.html` y el script inline del panel. Comparación con `main`: `calcularPMTRequerido`, `updateSuggestion`, `calcAccum`, `pmtParaFondo65` idénticas byte por byte. No se editaron constantes financieras ni `support-resources.js` ni credenciales.

**No ejecutado:** `node tests/presentation.cjs`, sus siete escenarios contra main, PDF real, reloj de navegador y screenshots. Por instrucción local no se intentó Chromium/Playwright. No se atribuye PASS a estas comprobaciones. La suite fue ampliada pero requiere ejecución y posibles ajustes por Claude.

**Capturas:** ninguna generada en este entorno. Ruta prevista del artifact: `/tmp/garba-ronda2-artifact`; procedimiento en `tests/README.md`. Pares antes (`415b4d4`) / después para proyección, móvil, seguimiento, Biblioteca, meta/brecha y panel; captura 1440×900 reducida a 390 px. Validar que todas las capturas existan y revisarlas visualmente antes de aprobación. El código de captura comprueba el mismo fixture financiero. El texto debe evaluarse en Meet; no basta comprobar dimensiones.

## [REVISAR CHRISTIAN] original → simplificado

No se modificaron textos contractuales/fiscales de respaldo. Revisar estas frases nuevas de presentación:

| Original existente | Texto mostrado |
|---|---|
| Capital proyectado para retiro / Capital estimado a los 65 | Lo que vas a juntar a los 65 |
| Ingreso mensual estimado desde los 65 | Lo que recibes cada mes desde los 65 |
| En pesos futuros · referencia ilustrativa | Es una estimación. El dinero de [año] no vale lo mismo que el de hoy. |
| Pausar · Hasta 12 meses; Puedes pausar hasta 12 meses durante la vigencia del plan | ¿Un mal año? Puedes parar hasta 12 meses. (Detalle conserva la vigencia.) |
| Aportar más · Cuando tengas excedentes | ¿Te sobró dinero? Lo puedes meter. |
| Incrementar · Si aumentan tus ingresos | Subir tu aportación · ¿Ganas más? Aportas más. |
| Retiros parciales · Aplican condiciones | Sacar una parte · Retiros parciales. Aplican condiciones. |
| Hasta 50% del saldo comprometido en alternativas conservadoras; Préstamos sujetos a aprobación de Allianz y a las condiciones del contrato | Hasta 50% del saldo comprometido en alternativas conservadoras, sujeto a aprobación de Allianz y a las condiciones del contrato. |
| Posible exención de ISR bajo los lineamientos específicos | Posible exención de ISR (impuesto sobre la renta) bajo los lineamientos específicos. |
| Etapa 1 · Mes 1–18 · Construcción de la base | Primeros 18 meses: armas tu base; Mes 18 · tu base está lista: se abren tus opciones |
| Fecha en que lo decidimos | ¿Cuándo te busco?; Para entonces ya… |
| Identifiquemos qué te falta para tomar una decisión | Veamos qué te falta para decidir |

Bono literal: «Tu constancia puede ser reconocida con un bono sujeto a las condiciones del plan». Leyenda de riesgo literal conservada. Confirmar especialmente que «se abren tus opciones» no se interprete como disponibilidad incondicional: las condiciones completas permanecen en el detalle y Biblioteca.

## Revisión, commits y reversión

Claude Code debe ejecutar la suite con export de `main` como baseline, revisar cada captura y el PDF, verificar restauración de `?flujo=clasico`, navegación de apertura desde panel (también fuera de calculadora), ausencia de errores de consola y legibilidad compartida. No pedir OK de publicación antes de esa revisión.

No hay siete commits porque la instrucción local prohíbe crearlos. Los cambios comparten archivos; Claude debe separar por hunks en el orden 1–7, sin incluir cambios ajenos. Antes de revertir, guardar un diff y los archivos nuevos. Para deshacer esta ronda, restaurar únicamente sus hunks al contenido de `415b4d4` y retirar solo `projection-path.js`, `tests/projection-static.cjs` y estos documentos nuevos si se desea; no usar reset/clean ni restauración global sobre trabajo posterior. `?flujo=clasico` permite revisar el recorrido previo sin borrar la sesión; no es una reversión del código.

No aprobado para publicación: revisión final de Claude y confirmación de Christian pendientes.

Validación adicional sin navegador: el script real del panel pasó con reloj/canal simulados a 11:59 y 12:00 en los actos 1 y 2, botón de señal de cierre y emisión del comando de apertura. No prueba comunicación real entre ventanas.

FIN
