require 'open3'
require 'yaml'
require_relative 'hooks_utils'
require_relative '../../lib/python/venv'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze
APPS_DIR = "#{REPO_DIR}/apps".freeze
PYTHON_DIR = "#{REPO_DIR}/python".freeze
SHARED_JS_DIR = "#{REPO_DIR}/shared/js".freeze
SCSS_GLOB = "#{REPO_DIR}/#{YAML.load_file('.scss-lint.yml')['scss_files'] || '*'}".freeze

def filter_eslint_apps(modified_files)
  full_apps_dir = File.expand_path(APPS_DIR)

  modified_files.select do |f|
    f.start_with?(full_apps_dir) && f.end_with?(".js", ".jsx", ".ts", ".tsx")
  end
end

def filter_python(modified_files)
  full_python_dir = File.expand_path(PYTHON_DIR)

  modified_files.select do |f|
    f.start_with?(full_python_dir) && f.end_with?(".py", ".pyi")
  end
end

def filter_eslint_shared(modified_files)
  modified_files.select do |f|
    f.match(%r{/shared/js/[^/]+.js})
  end
end

def filter_scss_apps(modified_files)
  modified_files.select {|f| f.include?('apps/') && f.end_with?(".scss")}
end

RUBY_EXTENSIONS = ['.rake', '.rb', 'Rakefile', 'Gemfile'].freeze
def filter_rubocop(modified_files)
  modified_rb_rake_files = modified_files.select do |f|
    RUBY_EXTENSIONS.any? {|ext| f.end_with? ext}
  end
  modified_ruby_scripts = modified_files.select do |f|
    first_line = File.file?(f) ? File.open(f).first : nil
    first_line&.ascii_only? && first_line&.match(/#!.*ruby/)
  end
  modified_ruby_scripts + modified_rb_rake_files
end

def filter_haml(modified_files)
  modified_files.select {|f| f.end_with?(".haml")}
end

def filter_scss(modified_files)
  modified_files.select {|f| File.fnmatch(SCSS_GLOB, f)}
end

def run(cmd, working_dir)
  Dir.chdir working_dir
  stdout, stderr, status = Open3.capture3(cmd)
  return stdout, stderr, status
end

def run_rubocop(files)
  run("bundle exec rubocop --force-exclusion #{files.join(' ')}", REPO_DIR)
end

def run_eslint_apps(files)
  run("./node_modules/.bin/eslint -c .eslintrc.js -f ./.eslintCustomMessagesFormatter.js #{files.join(' ')}", APPS_DIR)
end

def run_eslint_shared(files)
  # Use vanilla eslint parser, because babel-eslint always allows es6
  run("../../apps/node_modules/eslint/bin/eslint.js #{files.join(' ')}", SHARED_JS_DIR)
end

def run_stylelint_apps(files)
  run("./node_modules/.bin/stylelint #{files.join(' ')} --config stylelint.config.js", APPS_DIR)
end

def run_python(files)
  run("#{Python::Venv.lint_command} #{files.join(' ')}", PYTHON_DIR)
end

def run_haml(files)
  run("bundle exec haml-lint #{files.join(' ')}", REPO_DIR)
end

def run_scss_dashboard(files)
  run("bundle exec scss-lint #{files.join(' ')}", REPO_DIR)
end

def lint_failure(output)
  puts output
  `terminal-notifier -message "Lint failed"` if system('which terminal-notifier')
  raise "Lint failed"
end

# Helper method for running the appropriate linter on each of a subset of
# files. If no branches are specified, that subset will be all the files staged
# in git to be committed; this is useful for running linting in a pre-commit
# hook. If branches are specified, that subset will be those files that have
# been changed between branches; this is useful for a continuous integration or
# pre-merge hook.
def do_linting(base = nil, current = nil)
  modified_files =
    if base.nil? || current.nil?
      HooksUtils.get_staged_files
    else
      # Because one way for a file to be changed between branches is for it to
      # have been deleted, we want to make sure we're only trying to lint files
      # that actually exist on the filesystem.
      HooksUtils.get_changed_files_between_branches(base, current).select {|f| File.exist?(f)}
    end

  todo = {
    Object.method(:run_haml) => filter_haml(modified_files),
    Object.method(:run_scss_dashboard) => filter_scss(modified_files),
    Object.method(:run_eslint_apps) => filter_eslint_apps(modified_files),
    Object.method(:run_eslint_shared) => filter_eslint_shared(modified_files),
    Object.method(:run_stylelint_apps) => filter_scss_apps(modified_files),
    Object.method(:run_python) => filter_python(modified_files),
    Object.method(:run_rubocop) => filter_rubocop(modified_files)
  }

  todo.each do |func, files|
    unless files.empty?
      stdout, stderr, status = func.call(files)
      lint_failure(stdout + stderr) unless status.success?
    end
  end
end

do_linting(*ARGV)
