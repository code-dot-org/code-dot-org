/** @type {import('release-it').Config} */
const defaultConfig = {
    git: {
        commit: true,
        tag: true,
        push: false,
        tagName: '${npm.name}@${version}',
        "commitMessage": "chore: release `${npm.name}` v${version}"
    },
    github: {
        release: false
    },
    npm: {
        publish: false,
        versionArgs: ["--workspaces-update=false"]
    },
    plugins: {
        '@release-it/conventional-changelog': {
            path: '.',
            infile: 'CHANGELOG.md',
            preset: {
                name: "conventionalcommits",
                types: [
                    { type: 'fix', section: 'Bug Fixes' },
                    { type: 'feat', section: 'Features' },
                    { type: 'perf', section: 'Performance' },
                    { type: 'chore', section: 'Chores'},
                    { type: 'test', section: 'Test coverage' },
                    { type: 'docs', section: 'Documentation' },
                    { type: 'refactor', section: 'Refactors' },
                ],
            },
            gitRawCommitsOpts: {
                path: '.',
            },
            commitsOpts: {
                path: '.'
            }
        },
    },
};

/** @type {import('release-it').Config} */
function createConfig (packageName) {
    let config = {...defaultConfig};

    config.plugins['@release-it/conventional-changelog'].tagOpts = {
        prefix: packageName
    }

    return config;
}

module.exports = {
    createConfig
}