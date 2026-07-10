# @code-dot-org/certificates

CodeAI certificate rendering package.

This package is the `3.1` scaffold for the OpenSpec change
`replace-certificate-rendering`. It provides:

- a standalone Vite dev server
- canonical certificate route fixtures
- an MSW-backed API surface for local inspection
- a small Playwright visual harness

Run it from `frontend/`:

```bash
yarn workspace @code-dot-org/certificates dev
```

The standalone server serves the certificate route families directly:

- `/certificates/:encodedParams`
- `/certificates/blank`
- `/certificates/batch`
- `/print_certificates/:encodedParams`
- `/print_certificates/batch`
- `/congrats`
