require 'open3'

REPO_DIR = File.expand_path('../../../', __FILE__)
APPS_DIR = "#{REPO_DIR}/apps"

def get_modified_files
  Dir.chdir REPO_DIR
  `git diff --cached --name-only`.split("\n").map(&:chomp).map { |x| File.expand_path("../../../#{x}", __FILE__)}
end

def filter_grunt_jshint(modified_files)
  modified_files.select { |f| f.end_with?(".js") }
end

def filter_rubocop(modified_files)
  modified_files.select { |f| f.end_with?(".rb") }
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
  run("bundle exec rubocop #{files.join(" ")}", REPO_DIR)
end

def run_jshint(files)
  run("grunt jshint:files --files #{files.join(",")}", APPS_DIR)
end

def run_haml(files)
  run("bundle exec haml-lint #{files.join(" ")}", REPO_DIR)
end

def lint_failure(output)
  puts output
  raise "Lint failed"
end

def do_linting()
  modified_files = get_modified_files()
  todo = {
    Object.method(:run_haml) => filter_haml(modified_files),
    Object.method(:run_jshint) => filter_grunt_jshint(modified_files),
    Object.method(:run_rubocop) => filter_rubocop(modified_files)
  }

  todo.each do |func, files|
    if files.length > 0
      stdout, _, status = func.call(files)
      lint_failure(stdout) unless status.success?
    end
  end
end

do_linting()
