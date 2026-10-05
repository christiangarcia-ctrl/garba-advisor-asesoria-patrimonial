# Presentation checks

Run `node tests/presentation.cjs` with Playwright installed or available through `NODE_PATH`. Set `CHROME_EXECUTABLE` to use an existing Chrome installation.

Optional environment variables:
- `ADVISOR_BASELINE`: checkout of the original presentation, used to compare seven financial scenarios, report values and both detail tables.
- `ADVISOR_TEST_OUTPUT`: directory for review screenshots (defaults to the system temporary directory).

The test serves the site locally, blocks external network requests and uses synthetic client data. Identified-session persistence is tested against an in-page mock, never a real customer or service.

Checks include full-screen support resources, nested bonus/cost/fiscal views, keyboard return, live input/results/chart, suggested-contribution convergence, incomplete-input protection, history, and responsive layouts. It also checks that a new diagnosis can enter its sustainable contribution in the calculator without the old reality page or confirmation modal.
