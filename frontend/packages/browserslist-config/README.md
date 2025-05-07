# Code.org Shared Browserslist Config

This package hosts the browser statistics and [browserslist](https://browsersl.ist/) config used by Code.org frontend applications for configuring polyfills, bundlers, and other frontend build tools.

## Usage

To use this package, add the following to your `package.json`:

```json
{
  "browserslist": [
    "extends @code-dot-org/browserslist-config"
  ]
}
```

## Updating the Browserslist Config

1. Download an updated Google Analytics browser exploration CSV report using the instructions from the [browserslist-ga-export](https://github.com/browserslist/browserslist-ga-export) tool.
   a. Use the last 12 months for the date range.
2. Generate `browserslist-stats.json` using the following command:
    ```bash
    yarn dlx browserslist-ga-export --reportPath <path-to-report.csv>
    ```
3. Commit the new `browserslist-stats.json` file to this repo