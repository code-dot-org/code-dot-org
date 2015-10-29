# cdo-nodejs

Installs NodeJS.

## Attributes

- `node['cdo-nodejs']['version']` - the version of Node.js to install, automatically selecting the latest patch release.
  Valid values are from [NodeSource distribution](https://github.com/nodesource/distributions) IDs, currently: `"0.10"`, `"0.12"`, or `"4.x"`.
- `node['cdo-nodejs']['npm_version']` - [semver](https://docs.npmjs.com/getting-started/semantic-versioning) string of npm version to install, e.g., `"2"` or `"latest"`
