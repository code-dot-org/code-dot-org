REPO_DIR = File.expand_path('../../../', __FILE__)
APPS_DIR = "#{REPO_DIR}/apps"

def get_modified_files
  Dir.chdir REPO_DIR
  cmd = "git status -s"
  output = `#{cmd}`

  modified_paths = []
  modified_prefix = ['A', 'M', 'AM']
  output.split("\n").each do |line|
    line = line.strip().split(" ")
    if modified_prefix.member?(line[0])
      modified_paths << "#{REPO_DIR}/#{line[1]}"
    end
  end
  return modified_paths
end

def filter_grunt_jshint(modified_files)
  return modified_files.select { |f| f.start_with?(APPS_DIR) and f.end_with?(".js") }
end

def filter_rubicop(modified_files)
  return modified_files.select { |f| f.end_with?(".rb") }
end

def filter_haml(modified_files)
  return modified_files.select { |f| f.end_with?(".haml") }
end

def run_rubocop(files)
  Dir.chdir REPO_DIR
  cmd = "rubocop #{files.join(" ")}"
  return system cmd
end

def run_jshint(files)
  Dir.chdir APPS_DIR
  cmd = "grunt jshint:files --files #{files.join(",")}"
  return system cmd
end

def run_haml(files)
  Dir.chdir REPO_DIR
  cmd = "haml-lint #{files.join(" ")}"
  return system cmd
end

modified_files = get_modified_files()
puts "\nFound #{modified_files.length} modified files", "-" * 30
puts modified_files

jshint_files = filter_grunt_jshint(modified_files)
puts "\nRunning #{jshint_files.length} files through grunt jshint", "-" * 30
puts jshint_files
raise "JSHint failed" unless jshint_files.empty? or run_jshint(jshint_files)

ruby_files = filter_rubicop(modified_files)
puts "\nRunning #{ruby_files.length} through rubocop", "-" * 30
puts ruby_files
raise "Rubocop failed" unless ruby_files.empty? or run_rubocop(ruby_files)

haml_files = filter_haml(modified_files)
puts "\nRunning #{haml_files.length} through haml-lint", "-" * 30
puts haml_files
raise "Haml-lint failed" unless haml_files.empty? or run_haml(haml_files)
