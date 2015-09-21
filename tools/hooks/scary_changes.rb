#!/usr/bin/env bundle exec ruby
require 'open3'

REPO_DIR = File.expand_path('../../../', __FILE__)
APPS_DIR = "#{REPO_DIR}/apps"

def git_list_changes(opts = {})
  command = "git diff --cached --name-only"

  if opts[:filter]
    command += " --diff-filter #{opts[:filter]}"
  end

  Dir.chdir REPO_DIR do
    `#{command}`.split("\n")
  end
end

def detect_level_changes
  changes = $all.grep(/^dashboard\/config\/scripts/)
  return if changes.empty?

  puts "Looks like you changed script or level files outside of levelbuilder:"
  puts changes
  puts "You (or the dev of the day) may have to run `rake seed:all FORCE_CUSTOM_LEVELS=1` when you do the levelbuilder deploy."
end

def detect_new_models
  changes = $added.grep(/^dashboard\/app\/models/)
  return if changes.empty?

  puts "Looks like you are adding dashboard model(s)."
  puts changes.join("\n")
  puts "If you are adding new descendents of Level, there will be a deploy glitch that affects any students with progress in the scripts that contain this level. TO avoid this you can deploy this model code before deploying the code that adds it to scripts."
end

def detect_db_changes
  changes = $all.grep(/^dashboard\/db\/migrate/)
  return if changes.empty?

  unless changes.empty?
    puts "Looks like you are adding a migration:"
    puts changes.join("\n")
    puts "How long will it take to run in production, and if more than a couple minutes, is it possible to run it outside of the deployment?"
  end
end

def detect_scary_changes
  $modified = git_list_changes(filter: 'M')
  $added = git_list_changes(filter: 'A')
  $deleted = git_list_changes(filter: 'D')
  $all = $modified + $added + $deleted

  detect_db_changes
  detect_level_changes
  detect_new_models
end

detect_scary_changes
