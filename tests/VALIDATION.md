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

## Mobile PDF update

Default PDF exports use 360 × 640 pt portrait pages, a single column, selectable text and a minimum 16 pt body font. Projection and ZIP executive report: 15 pages for the synthetic sample. Investment strategy: 3 pages. Page count varies with actual client text. Headers and pagination use smaller auxiliary text.

The `mobile-pdf.js` renderer reads current report DOM values and strategy copy. It does not recalculate or alter financial methodology. All 144 visible original report text fragments in the sample are preserved. ZIP executive text equals the direct projection PDF. Extracted text bounds stay inside the pages.

Run `tests/mobile-pdf.cjs` for real browser downloads, then `python3 tests/verify-mobile-pdf.py PATH_TO_EVIDENCE` with PyMuPDF installed to verify dimensions, body font sizes, selectable text, bounds, original report text preservation and ZIP equivalence. All pages were rendered at 390 px wide and inspected visually.
