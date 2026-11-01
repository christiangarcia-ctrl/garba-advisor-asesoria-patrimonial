/* NODE_PATH=/path/to/playwright node tests/capture-lienzo.cjs
   Runs the same checks before writing captures. No external AI or real client data. */
process.env.ADVISOR_TEST_OUTPUT=process.env.ADVISOR_TEST_OUTPUT||require('node:path').join(require('node:os').tmpdir(),'advisor-ronda4-capturas');
require('./presentation.cjs');
