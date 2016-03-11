require 'open3'
require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__)
APPS_DIR = "#{REPO_DIR}/apps"

def filter_grunt_jshint(modified_files)
  modified_files.select do |f|
    (f.end_with?(".js", ".jsx")) &&
      !(f.end_with?('.min.js') || f.match(/public\/.+package\//) || f.match(/blockly-core\//) || f.match(/apps\/lib\//) || f.match(/shared\//))
  end
end

RUBY_EXTENSIONS = ['.rake', '.rb', 'Rakefile']
def filter_rubocop(modified_files)
  modified_rb_rake_files = modified_files.select do |f|
    RUBY_EXTENSIONS.any? {|ext| f.end_with? ext }
  end
  modified_ruby_scripts = modified_files.select do |f|
    first_line = File.open(f).first
    first_line && first_line.ascii_only? && first_line.match(/#!.*ruby/)
  end
  modified_ruby_scripts + modified_rb_rake_files
end

def filter_haml(modified_files)
  modified_files.select { |f| f.end_with?(".haml") }
end

def run(cmd, working_dir)
  Dir.chdir working_dir
  stdout, stderr, status = Open3.capture3(cmd)
  return stdout, stderr, status
end

def run_rubocop(files)
  run("bundle exec rubocop --force-exclusion #{files.join(" ")}", REPO_DIR)
end

def run_eslint(files)
  run("./node_modules/.bin/eslint -c .eslintrc.js #{files.join(" ")}", APPS_DIR)
end

def run_haml(files)
  run("bundle exec haml-lint #{files.join(" ")}", REPO_DIR)
end

def lint_failure(output)
  puts output
  raise "Lint failed"
end

def do_linting()
  modified_files = HooksUtils.get_staged_files
  todo = {
    Object.method(:run_haml) => filter_haml(modified_files),
    Object.method(:run_eslint) => filter_grunt_jshint(modified_files),
    Object.method(:run_rubocop) => filter_rubocop(modified_files)
  }

  todo.each do |func, files|
    if !files.empty?
      stdout, stderr, status = func.call(files)
      lint_failure(stdout + stderr) unless status.success?
    end
  end
end

do_linting()
