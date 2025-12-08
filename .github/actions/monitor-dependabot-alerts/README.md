# Dependabot Alert Monitor

This GitHub Action monitors Dependabot security alerts and creates/updates a GitHub issue when critical or high-severity alerts exist **without associated pull requests**.

## Problem It Solves

When Dependabot detects a vulnerability but **cannot create a PR** (typically due to path-based dependencies in `Gemfile`), the alert sits in the Security tab unnoticed. This action:

1. **Detects** alerts without PRs
2. **Creates/updates** a GitHub issue listing them
3. **Runs daily** to keep the issue current

## How It Works

1. **Fetches all open Dependabot alerts** via GitHub API
2. **Checks each alert** to see if there's an open Dependabot PR for that dependency
3. **Filters** to only critical/high severity alerts
4. **Creates or updates** a GitHub issue with the list

## Workflow

The workflow (`.github/workflows/monitor-dependabot-alerts.yml`) runs:
- **Daily at 9 AM UTC** (1 AM PST / 2 AM PDT)
- **Manually** via `workflow_dispatch`

## Issue Format

The created issue includes:
- List of critical/high alerts without PRs
- Severity, CVE, days open, and links
- Action items for manual PR creation

## Permissions Required

The workflow needs:
- `issues: write` - to create/update issues
- `security-events: read` - to read Dependabot alerts
- `contents: read` - to checkout code

## Example Output

```
🚨 Dependabot Alerts Without PRs (2 critical/high)

### 1. activestorage (rubygems)
- Severity: CRITICAL (CVSS: 9.2)
- CVE: CVE-2025-24293
- Days Open: 120
- Alert: [#955](https://github.com/.../security/dependabot/955)
- Summary: Active Storage allowed transformation methods...
```

## Troubleshooting

**Why might an alert not have a PR?**
- Path-based dependencies in `Gemfile` (GitHub-based gems, local engines)
- Dependabot configuration issues
- Dependency conflicts that prevent auto-updates

**How to fix alerts without PRs?**
1. Review the alert details
2. Manually create a PR to update the dependency
3. Consider reducing path-based dependencies to enable auto-PRs

