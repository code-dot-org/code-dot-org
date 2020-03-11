require 'open3'
require 'yaml'
require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze
APPS_DIR = "#{REPO_DIR}/apps".freeze
SHARED_JS_DIR = "#{REPO_DIR}/shared/js".freeze
SCSS_GLOB = "#{REPO_DIR}/#{YAML.load_file('.scss-lint.yml')['scss_files'] || '*'}".freeze

def filter_eslint_apps(modified_files)
  modified_files.select do |f|
    (f.end_with?(".js", ".jsx")) &&
      !(f.end_with?('.min.js') ||
        f.match(/public\/.+package\//) ||
        f.match(/apps\/lib\//) ||
        f.match(/shared\//) ||
        f.match(/dashboard\/config\//)
       )
  end
end

def filter_eslint_shared(modified_files)
  modified_files.select do |f|
    f.match(%r{/shared/js/[^/]+.js})
  end
end

RUBY_EXTENSIONS = ['.rake', '.rb', 'Rakefile', 'Gemfile'].freeze
def filter_rubocop(modified_files)
  modified_rb_rake_files = modified_files.select do |f|
    RUBY_EXTENSIONS.any? {|ext| f.end_with? ext}
  end
  modified_ruby_scripts = modified_files.select do |f|
    first_line = File.file?(f) ? File.open(f).first : nil
    first_line && first_line.ascii_only? && first_line.match(/#!.*ruby/)
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

def run_haml(files)
  run("bundle exec haml-lint #{files.join(' ')}", REPO_DIR)
end

def run_scss(files)
  run("bundle exec scss-lint #{files.join(' ')}", REPO_DIR)
end

def lint_failure(output)
  puts output
  `terminal-notifier -message "Lint failed"` if system('which terminal-notifier')
  raise "Lint failed"
end

def do_linting
  modified_files = HooksUtils.get_staged_files
  todo = {
    Object.method(:run_haml) => filter_haml(modified_files),
    Object.method(:run_scss) => filter_scss(modified_files),
    Object.method(:run_eslint_apps) => filter_eslint_apps(modified_files),
    Object.method(:run_eslint_shared) => filter_eslint_shared(modified_files),
    Object.method(:run_rubocop) => filter_rubocop(modified_files)
  }

  todo.each do |func, files|
    unless files.empty?
      stdout, stderr, status = func.call(files)
      lint_failure(stdout + stderr) unless status.success?
    end
  end
end

do_linting
