REPO_DIR = File.expand_path('../../../', __FILE__)

# Hash of several common requirements file patterns. Note that not all
# of these are currently used, but are included for future-proofing.
REQUIREMENTS = {
  "requirements.txt" => { cmd: "pip install -r requirements.txt", dir: "./" },
  "package.json" => { cmd: "yarn", dir: "./apps" },
  "bower.json" => { cmd: "bower install", dir: "./" },
  "Gemfile" => { cmd: "bundle install", dir: "./" },
  "Berksfile" => { cmd: "berks install", dir: "./" },
  "schema.rb" => { cmd: "rake db:migrate", dir: "./dashboard" },
}

def get_modified_files
  prev_head = ARGV[0]
  new_head = ARGV[1]
  Dir.chdir REPO_DIR
  return `git diff --name-only #{prev_head} #{new_head}`.split("\n").map(&:chomp)
end

# git's post-checkout hook will pass in a third argument: 1 if the
# checkout is changing branches, 0 if the checkout is checking out a
# particular file. We don't want to do anything in file checkout mode
def file_checkout?
  return ARGV.fetch(2, "1") == "0"
end

def optionally_run(cmd)
  if ARGV[3] == "checkout"
    return
  end
  puts "Shall I run #{cmd[:cmd]}? [y/N]"
  if $stdin.readline.downcase.start_with? 'y'
    Dir.chdir File.expand_path(cmd[:dir], REPO_DIR)
    system cmd[:cmd]
  end
end

unless file_checkout?
  modified_files = get_modified_files

  modified_files.each do |file|
    basename = File.basename(file)
    if REQUIREMENTS.key?(basename)
      puts "#{file} changed; you probably want to run #{REQUIREMENTS[basename][:cmd]} or rake build"
      optionally_run REQUIREMENTS[basename]
    end
  end
end
