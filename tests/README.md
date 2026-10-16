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

## Full two-application acceptance audit

Run `node tests/experience.cjs` with Playwright available through `NODE_PATH` and optionally `CHROME_EXECUTABLE`. Set `GARBA_AUDIT_ROOT` to a directory containing these checkouts:

- `garba-advisor`: this design branch.
- `mi-punto-de-partida`: the companion design branch.
- `advisor-baseline`: commit `0f46b4c`.
- `pdp-baseline`: companion commit `6ae0c6e`.

`GARBA_AUDIT_OUTPUT` selects the evidence directory. The audit runs the full diagnosis, compares its complete output against baseline, captures advisory scenes and all native support resources at three widths, checks every precapture section, downloads projection/strategy PDFs and the records ZIP, and checks browser errors and horizontal overflow. All external HTTPS requests are blocked. No real identity, email, scheduling, customer save or message is used.

The projection, strategy and records package are captured as actual application downloads. PDFs use the mobile format described below. Existing financial assumptions remain unchanged. The credentials reference is retained as the original image, with an enlarge link.

## Mobile PDF acceptance

The default projection, investment strategy and executive report in the records ZIP use `pdf-mobile.js`: 360 × 640 pt portrait pages, one column, selectable text and 16 pt body copy. Pages grow in count rather than shrinking the text. Headings and cards stay with their content where they fit. The renderer reads the existing report values and strategy text without changing financial formulas.

Run `node tests/mobile-pdf.cjs` with `GARBA_AUDIT_ROOT`, `GARBA_AUDIT_OUTPUT`, `NODE_PATH` and optional `CHROME_EXECUTABLE` as above. It captures real downloads from the projection control, strategy control and ZIP. It checks the mobile page dimensions and stores the original report text for PDF extraction comparison. Render generated PDFs at 390 px wide for visual review.

After the mobile download test, run `python3 tests/verify-mobile-pdf.py PATH_TO_EVIDENCE` (PyMuPDF) for independent extraction and layout checks.
