# Presentation checks

Run `node tests/presentation.cjs` with Playwright installed or available through `NODE_PATH`. Set `CHROME_EXECUTABLE` to use an existing Chrome installation.

Optional environment variables:
- `ADVISOR_BASELINE`: checkout of the original presentation, used to compare seven financial scenarios, report values and both detail tables.
- `ADVISOR_TEST_OUTPUT`: directory for review screenshots (defaults to the system temporary directory).

The test serves the site locally, blocks external network requests and uses synthetic client data. Identified-session persistence is tested against an in-page mock, never a real customer or service.

Checks include full-screen support resources, nested bonus/cost/fiscal views, keyboard return, live input/results/chart, suggested-contribution convergence, incomplete-input protection, history, and responsive layouts. It also checks that a new diagnosis can enter its sustainable contribution in the calculator without the old reality page or confirmation modal.

The calculator keeps three controls fixed above a single scrollable results area, with projection, gap and detail tabs. Name and age come from the diagnosis and are read-only. Additional assumptions remain in a keyboard-accessible dialog. Tests cover these behaviors at desktop, tablet and phone dimensions.

Support consolidation: resources 3 and 4 share a single PPR explanation; resource 11 is integrated as the Investment tab of resource 8. Library entries 3, 9 and 11 are removed from the visible sequence; personalized routes are normalized to the retained resources. Existing accreditation, Allianz backing and onboarding resources remain.

Image provenance: `img/allianz-familia.png` is extracted unchanged from page 4 of the local official “Folleto OptiMaxx plus 2025.pdf”. Retirement category photographs remain from the colleague reference; the percentages remain labeled as reference figures without a specified statistical source. The welcome portrait is removed.

## Ronda 2 — base obligatoria 415b4d4

En el sandbox solo se ejecutan las comprobaciones sin Chromium:

```sh
node tests/projection-static.cjs
node --check projection-path.js
node --check presentation.js
node --check calculator-layout.js
node --check three-acts.js
node --check tests/presentation.cjs
```

La prueba estática ejecuta la geometría y los cinco toggles con un DOM mínimo, y compara cuatro rutinas financieras con `main`. **No sustituye** las siete comparaciones financieras de navegador ni comprueba CSS, PDF renderizado o legibilidad.

Para Claude, fuera del sandbox: preparar dos carpetas de solo lectura a partir de `git archive main` y `git archive 415b4d4` (sin cambiar este worktree). `ADVISOR_BASELINE` es una **ruta al checkout/export de main**, no el literal `main`. La segunda carpeta sirve únicamente para las capturas antes/después.

```sh
ADVISOR_BASELINE=/ruta/export-main ADVISOR_ROUND2_BEFORE=/ruta/export-415b4d4 ADVISOR_TEST_OUTPUT=/tmp/garba-ronda2-artifact node tests/presentation.cjs
```

El artifact incluye pares `round2-before-*` / `round2-after-*` para proyección, móvil, seguimiento, Biblioteca, meta/brecha y panel privado. Se verifica que las cifras del fixture antes/después sean idénticas. `*-mobile-shared-390.png` reduce una captura real de 1440×900 a 390 px; la legibilidad requiere inspección humana. La nueva tarjeta móvil ocupa una página adicional (cinco páginas en total). Antes corresponde al modo móvil de la base, que carecía de esa tarjeta.

Cobertura nueva: escala y extremo de onda, fechas/edades para dos edades, cinco toggles sin navegación, ausencia visible de costo de esperar, tarjeta móvil, persistencia/resumen/PDF de seguimiento, avisos privados a los doce minutos con reloj simulado y señal de trámite. Revisar también la navegación real desde el botón privado a la apertura y fallback localStorage entre ventanas.
