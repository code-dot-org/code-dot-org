# non-aws-bootstrap

Creates the early post-AWS bootstrap resources that now live under `phase2`:

- External Secrets Operator itself
- Kargo git writeback bootstrap
- the GitHub organization webhook for Kargo

The parent root passes cluster fields, IAM role ARNs, and optional bootstrap
secrets into this module.
