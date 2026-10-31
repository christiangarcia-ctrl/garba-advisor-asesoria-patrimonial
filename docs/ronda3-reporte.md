# Ronda 3 — Tu camino

Cambios en el árbol de trabajo; sin commit. La carpeta docs/maqueta ya existía sin seguimiento y se conservó.

1. Hecho: vista basada directamente en el HTML de maqueta, narración, cifra a los 65, pasos, chips, SVG, onda y respuesta móvil. Curva interpolada entre saldos anuales del motor con puntos exactos en fondoPlan y fondo65. Pendiente QA visual real y comprobar que cada estado cabe completo a 1440×900; se dejó aserción de scroll interno y de documento.
2. Hecho: controles reales compactos, régimen y reinversión; meta trasladada a la pestaña de brecha. En clásico se conserva la distribución anterior.
3. Hecho: 10/15/20/25 en el recorrido nuevo; asignaciones de valores guardados normalizadas al más cercano y aviso junto al selector. El recorrido clásico conserva 30 para no alterar sus escenarios históricos.
4. Hecho: aviso rojo sin impedir el cálculo con los mínimos solicitados.
5. Hecho: cifra nueva a los 65 usa ingreso65; paso de Art. 93 usa ingreso60. El bloque de ingreso conservado de calculator-layout también usa ingreso65.
6. Hecho: devolución de visualización separada de la devolución reinvertida. No modifica saldos, reporte ni PDF.
7. Hecho: campo de ingreso de paso 5 escribe en ingresoMensualCliente y dispara su listener existente; al recalcular se refleja cualquier cambio desde Más ajustes.
8. Hecho: textos de chips y paso fiscal tomados del HTML aprobado y del encargo.
9. Hecho: sin cambios en panel, seguimiento, avisos ni Biblioteca. Código anterior de projection-path conservado como referencia sin ejecutar.

## Valores guardados en reportState

- ingreso65 e ingreso60: variables locales ya calculadas en actualizarReporteBase. ingreso60 ya existía en el estado.
- devolucionFiscalPrimerAnoVista: aportacionDeduciblePrimerAno × isrPct, exclusivamente para la vista y solo en Art. 151.

## Verificación

Pasó tests/projection-static.cjs: extremos, onda determinista no negativa y comparación de las seis funciones financieras contra main, permitiendo únicamente las asignaciones autorizadas. Pasó también la prueba existente del panel privado con reloj simulado.

node --check ejecutado sobre los JS modificados y ambos tests. Chromium no ejecutado en este sandbox: las siete comparaciones financieras, pruebas interactivas, capturas y ausencia de scroll siguen pendientes de ejecución. tests/presentation.cjs conserva las siete comparaciones y extiende capturas en la función round3Checks: inicial y 1–6 de 151, 5–6 de 93, montos rojos, sin reinvertir y celular 0/3/5. Ejecución: NODE_PATH apuntando a Playwright, ADVISOR_BASELINE al checkout de main y node tests/presentation.cjs; salida ADVISOR_TEST_OUTPUT o carpeta temporal advisor-design-checks.

## Revertir

Restaurar desde 0649c02 únicamente calculator-layout.js, index.html, presentation.css, presentation.js, projection-path.js y los dos tests modificados, tras revisar que no haya cambios posteriores de otra sesión. Eliminar este informe si corresponde. No tocar docs/maqueta ni otros archivos ajenos. No se publica ni se modifica producción.

FIN

## Revisión de Claude (2026-10-31)

Ajustes hechos en la revisión, con las pruebas completas en Chromium:
- Gráfica: en escritorio el viewBox usa los pixeles reales del SVG (antes se encogía y la letra quedaba diminuta).
- La regla que ocultaba todo lo que no fuera Tu camino también ocultaba la pregunta de cierre (Acto 3: "Necesito pensarlo", etc.) y el enlace a la brecha: se restauraron debajo de Tu camino.
- Opciones de arranque (#gaActOptions) pasan a "Tu meta y la brecha" (estaban ocultas).
- Controles de la tarjeta del Acto 2 (Modo celular, Ir a la decisión, Copiar resumen para WhatsApp) pasan a la cabecera de la calculadora (estaban ocultos con esa tarjeta).
- Modo celular: la tarjeta "Tu camino" se llena con los 4 hitos de los datos nuevos (quedaba vacía); el de 65 usa ingreso65.
- Cifras menores a un millón se muestran en pesos (antes "$0.7 millones").
- El aviso "Plazo ajustado de X a Y años" desaparece al tocar el selector de plazo.
- Pruebas: opciones en la pestaña de la brecha; la escala de la gráfica original ya no se exige igual al capital (vive con la línea de la meta); "cabe en 1440×900" se mide sobre Tu camino; la comparación antes/después ignora los guardados nuevos de solo lectura y la tarjeta ISR oculta (que en main conserva texto de un escenario 151 anterior).

Resultado: PASS 7 escenarios financieros idénticos a main (incluido reporte y tablas); PASS UI completa; PASS estático y panel privado.
