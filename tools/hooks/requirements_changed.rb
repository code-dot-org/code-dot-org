REPO_DIR = File.expand_path('../../../', __FILE__)

# Hash of several common requirements file patterns. Note that not all
# of these are currently used, but are included for future-proofing.
REQUIREMENTS = {
  "requirements.txt" => "pip install -r requirements.txt",
  "package.json" => "npm install",
  "bower.json" => "bower install",
  "Gemfile" => "bundle install",
  "Berksfile" => "berks install"
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

if !file_checkout?()
  modified_files = get_modified_files()

  modified_files.each do |file|
    basename = File.basename(file)
    if REQUIREMENTS.key?(basename)
      puts "#{file} changed; you probably want to run #{REQUIREMENTS[basename]} or rake build"
    end
  end
end
