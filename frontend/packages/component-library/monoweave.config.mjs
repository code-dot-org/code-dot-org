import {DEFAULT_COMMIT_TYPES} from 'conventional-changelog-conventionalcommits';

/**
 * Monoweave Configuration File for automated CHANGELOG and version bumping
 *
 * See: https://monoweave.github.io/monoweave/configuration
 */

/** @type {import('@monoweave/types').MonoweaveConfigFile} */
export default {
  preset: 'monoweave/preset-recommended',

  // Aggregates changelog entries to a single file instead of the "recommended"
  // default of per-workspace.
  changelogFilename: 'CHANGELOG.md',
  conventionalChangelogConfig: {
    name: 'conventional-changelog-conventionalcommits',
    types: [
      // allow chores to appear
      ...DEFAULT_COMMIT_TYPES.filter(commitType => commitType.type !== 'chore'),
      {type: 'chore', section: 'Miscellaneous Chores'},
    ],
  },
  dryRun: false,
  prerelease: true,
  prereleaseId: 'alpha',
  registryUrl: 'https://npm.pkg.github.com/',
  versionStrategy: {
    minimumStrategy: 'patch',
  },
};
