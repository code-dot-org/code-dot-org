require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

namespace :lint do
  desc 'Lints Ruby code with rubocop.'
  task :ruby do
    RakeUtils.bundle_exec 'rubocop'
  end

  desc 'Lints Haml code with haml-lint.'
  task :haml do
    RakeUtils.bundle_exec 'haml-lint dashboard pegasus'
  end

  desc 'Lints SCSS code with scss-lint.'
  task :scss do
    RakeUtils.bundle_exec 'scss-lint'
  end

  desc 'Lints JavaScript code.'
  task :javascript do
    Dir.chdir(apps_dir) do
      HipChat.log 'Linting <b>apps</b> JavaScript...'
      # lint all js/jsx files in dashboard/app/assets/javascript
      RakeUtils.system './node_modules/.bin/eslint -c .eslintrc.js ../dashboard/app/ --ext .js,.jsx'
      # also do our standard apps lint
      RakeUtils.system 'npm run lint'
    end
  end

  task all: [:ruby, :haml, :scss, :javascript]
end
desc 'Lints all code.'
task lint: ['lint:all']
