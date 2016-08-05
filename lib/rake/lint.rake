require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

def lint_if_changed(projects, &block)
  GitUtils.run_if_project_affected(projects, 'Starting linting.', 'Skipping linting.', &block)
end

def lint_apps_js
  Dir.chdir(apps_dir) do
    HipChat.log 'Linting <b>apps</b> JavaScript...'
    # lint all js/jsx files in dashboard/app/assets/javascript
    RakeUtils.system_stream_output './node_modules/.bin/eslint -c .eslintrc.js ../dashboard/app/ --ext .js,.jsx'
    # also do our standard apps lint
    RakeUtils.system_stream_output 'npm run lint'
  end
end

def lint_ruby
  RakeUtils.bundle_exec_streaming 'rubocop'
end

def lint_haml
  RakeUtils.bundle_exec_streaming 'haml-lint dashboard pegasus'
end

def lint_scss
  RakeUtils.bundle_exec_streaming 'scss-lint'
end

namespace :lint do
  desc 'Lints Ruby code with rubocop.'
  task :ruby do
    lint_ruby
  end

  desc 'Lints Haml code with haml-lint.'
  task :haml do
    lint_haml
  end

  desc 'Lints SCSS code with scss-lint.'
  task :scss do
    lint_scss
  end

  desc 'Lints JavaScript code.'
  namespace :javascript do
    task :apps do
      lint_apps_js
    end

    task :changed do
      lint_if_changed(:apps) do
        lint_apps_js
      end
    end
  end

  task javascript: ['javascript:apps']

  desc 'Lints code changed from staging.'
  task :changed do
    lint_if_changed(:apps) do
      lint_apps_js
    end

    lint_if_changed([:dashboard, :pegasus, :shared]) do
      lint_ruby
      lint_haml
      lint_scss
    end
  end

  task all: [:ruby, :haml, :scss, :javascript]
end
desc 'Lints all code.'
task lint: ['lint:all']
