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
