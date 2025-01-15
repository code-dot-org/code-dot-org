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
  conventionalChangelogConfig: 'conventional-changelog-conventionalcommits',
  dryRun: false,
  prerelease: true,
  prereleaseId: 'alpha',
  versionStrategy: {
    minimumStrategy: 'patch',
  },
};
