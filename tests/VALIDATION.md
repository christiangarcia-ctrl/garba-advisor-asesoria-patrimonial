# Design V2 acceptance — 2026-10-15

Validated in local Chromium with Playwright and synthetic identity only. External HTTPS is blocked during browser checks; identified persistence is mocked. No production message, email, scheduling or customer save is part of these checks.

- Complete Point of Departure journey, required-input handling and original output-state equality against `6ae0c6e`.
- Advisory regression: seven original financial/fiscal scenarios against `0f46b4c`, including report state and both detail tables.
- Live recalculation, chart, contribution suggestion, pending-output protection, history, result tabs, keyboard navigation and modal focus.
- Phone, landscape, tablet and desktop checks; all support resources and all four precapture sections captured.
- Actual projection export, strategy PDF download and records ZIP download. PDF pages rendered and visually inspected. The default projection, strategy and ZIP report now use the mobile renderer described below.
- Six retirement photos unchanged byte for byte. Percentages: 2%, 4%, 8%, 11%, 20%, 55%.
- Original financial calculation functions are preserved; only the export entry points delegate to the mobile renderer. Design scripts contain no financial formula changes.
- GitHub Pages source verified as `main` in both repositories; design branch only.

See `tests/README.md` for reproducible commands. Browser evidence and synthetic PDF/ZIP examples were delivered with the task. This validates preservation of existing calculations, not a change or independent certification of the underlying financial methodology.

## Compact editorial PDF update

Default PDFs now use the existing Montserrat brand font embedded in the PDF, a warm neutral background, navy figure cards, paired indicators and compact comparison rows. Standard synthetic sample: six projection pages, two strategy pages and six pages for the identical ZIP report. The layout uses 24 pt titles, 26–32 pt primary figures, 14–15 pt main copy and 12–13 pt auxiliary copy and legal text.

Repeated explanations are condensed. Canonical financial values are checked against the existing report DOM, and the full financial disclaimer remains. The renderer does not recalculate the model. Very long personalized narrative may require additional pages rather than clipping text.

Run `tests/mobile-pdf.cjs` for actual downloads and expected financial values, then `python3 tests/verify-mobile-pdf.py PATH_TO_EVIDENCE` (PyMuPDF) for page count, dimensions, embedded selectable text, bounds, financial-value preservation and ZIP equivalence. All pages are rendered at 390 px wide for visual review.

The strategy PDF includes a purely illustrative fluctuating curve with four numbered concepts: appreciation, accumulation, discipline and horizon. It is not calculated from customer balances, a historical price series or a return forecast. The explanatory copy covers both loss of current value and purchasing more units with continuing contributions, and states that recovery is not guaranteed. The standard PDF remains two pages.
