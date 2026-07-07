# pegasus-directory-removed

## ADDED Requirements

### Requirement: The pegasus directory does not exist
The repository SHALL NOT contain a `pegasus/` directory, and
`deployment.rb` SHALL NOT define `pegasus_dir`.

#### Scenario: directory and helper gone
- **WHEN** `test -d pegasus` and `grep -n "def pegasus_dir" deployment.rb` run at repo root
- **THEN** both find nothing

#### Scenario: no path references remain
- **WHEN** `grep -rn "pegasus_dir\|pegasus/cache\|pegasus/migrations\|pegasus/rake\|pegasus/test" --include=*.rb --include=*.rake --include=*.yml --include=*.erb --include=*.dockerfile --exclude-dir=.git . | grep -v openspec | grep -v specs/pegasus-removal` runs
- **THEN** it returns no matches

### Requirement: LFS and lint configs carry no pegasus rules
`.gitattributes` SHALL contain no `pegasus/` patterns, and haml-lint
configuration and the lint rake task SHALL NOT reference pegasus.

#### Scenario: config grep
- **WHEN** `grep -n "pegasus" .gitattributes .haml-lint.yml .haml-lint_todo.yml lib/rake/lint.rake` runs
- **THEN** it returns no matches

### Requirement: The k8s image pipeline has no pegasus layer
The k8s docker/skaffold configuration SHALL NOT define or reference
a `code-dot-org-pegasus` artifact.

#### Scenario: k8s grep
- **WHEN** `grep -rn "pegasus" k8s/` runs
- **THEN** it returns no matches

### Requirement: Relocated caches function at their new paths
The CloudFront alias cache and milestone-parser caches SHALL operate
under `deploy_dir('tmp', ...)` with unchanged behavior.

#### Scenario: milestone parser tests pass
- **WHEN** `shared/test/test_milestone_parser.rb` runs with the new cache path
- **THEN** it passes

#### Scenario: allowlist reader loads
- **WHEN** `bundle exec ruby -e "require_relative 'deployment'; require 'cdo/rack/allowlist'"` runs at repo root
- **THEN** it exits zero
