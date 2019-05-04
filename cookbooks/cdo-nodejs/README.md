# cdo-nodejs

Installs NodeJS.

## Attributes

- `node['cdo-nodejs']['version']` - the version of Node.js to install, automatically selecting the latest patch release.
  Valid values are from [NodeSource distribution](https://github.com/nodesource/distributions) IDs, currently: `"0.10"`, `"0.12"`, or `"4.x"`.
- `node['cdo-nodejs']['yarn_version']` - Yarn [APT package version](https://www.ubuntuupdates.org/ppa/yarn) to install, e.g., `'1.6.0-1'` 
