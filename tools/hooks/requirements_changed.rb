REPO_DIR = File.expand_path('../../../', __FILE__)

# Hash of several common requirements file patterns. Note that not all
# of these are currently used, but are included for future-proofing.
REQUIREMENTS = {
  "requirements.txt" => {cmd: "pip install -r requirements.txt", dir: "./"},
  "package.json" => {cmd: "yarn", dir: "./apps"},
  "bower.json" => {cmd: "bower install", dir: "./"},
  "Gemfile" => {cmd: "bundle install", dir: "./"},
  "Berksfile" => {cmd: "berks install", dir: "./"},
  "schema.rb" => {cmd: "rake db:migrate", dir: "./dashboard"},
}.freeze

def get_modified_files
  prev_head = ARGV[1]
  new_head = ARGV[2]
  Dir.chdir REPO_DIR
  return `git diff --name-only #{prev_head} #{new_head}`.split("\n").map(&:chomp)
end

# git's post-checkout hook will pass in a third argument: 1 if the
# checkout is changing branches, 0 if the checkout is checking out a
# particular file. We don't want to do anything in file checkout mode
FILE_CHECKOUT = ARGV.fetch(3, "1") == "0"
MERGE = ARGV[0] == "merge"
PROMPT_ENABLED = ENV['MERGE_RUN_PROMPT']

def optionally_run(cmd, file)
  puts "#{file} changed! Shall I run #{cmd[:cmd]}? [Y/n]"
  unless $stdin.readline.downcase.start_with? 'n'
    Dir.chdir File.expand_path(cmd[:dir], REPO_DIR)
    system cmd[:cmd]
  end
end

unless FILE_CHECKOUT
  modified_files = get_modified_files
  printed_suggestion = false

  modified_files.each do |file|
    basename = File.basename(file)
    next unless REQUIREMENTS.key?(basename)

    if MERGE && PROMPT_ENABLED
      optionally_run(REQUIREMENTS[basename], file)
    else
      if MERGE && !printed_suggestion
        puts "\nHey you! Set the environment variable MERGE_RUN_PROMPT to easily run the following command(s)"
        printed_suggestion = true
      end
      puts "#{file} changed; you probably want to run #{REQUIREMENTS[basename][:cmd]} or rake build"
    end
  end
end
