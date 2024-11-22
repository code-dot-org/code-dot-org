# @code-dot-org/lint-config

This package contains the Code.org engineering code style guide for the Code.org `frontend` directory.

**Note**: At this time, the top-level `apps` directory does not use this package.

This package includes:

1. Typescript Configuration Files (tsconfig)

## Typescript Configuration Files (tsconfig)

Various default `tsconfig.json` flavors are available for different Node.js versions and frameworks.

Most configurations use [@tsconfig](https://github.com/tsconfig/bases/tree/main) bases and this package 
overrides the base configuration for use within the Code.org engineering ecosystem.

When updating these configuration files, be sure to keep them as general as possible. For example, don't 
add `jsx` to the node flavors as that would make all consumers of the node flavor to include jsx in its
typescript compilation.

### Current Flavors

1. `tsconfig.node[version].json`: A tsconfig targeted for a specific node version.