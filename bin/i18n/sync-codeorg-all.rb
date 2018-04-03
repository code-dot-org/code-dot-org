#!/usr/bin/env ruby

# If run with the "interactive" flag, uns all steps necessary for a full i18n
# update:
#
# First, to process newly-added strings, we:
#   Sync In to collect various translations into a single source directory
#   Sync Up to upload that source directory to crowdin
#   Create a PR with the changes
#
# Then, to retrieve new translations for existing strings, we:
#   Sync Down to download new translations from crowdin
#   Sync Out to distribute those translations throughout our system
#   Create a PR with the changes
#
# Note that this script will reset the repo in which it is run to staging
# latest, and should therefore only be run with a clean working directory.
#
# Otherwise, if run with one of the "command" flags, will run a single step of
# the full sync

require_relative '../../lib/cdo/only_one'
require_relative '../../lib/cdo/github'

require_relative 'i18n_script_utils'

require_relative 'sync-codeorg-in'
require_relative 'sync-codeorg-up'
require_relative 'sync-codeorg-down'
require_relative 'sync-codeorg-out'

require 'optparse'

IN_UP_BRANCH = "i18n-sync-in-up-#{Date.today.strftime('%m-%d')}".freeze
DOWN_OUT_BRANCH = "i18n-sync-down-out-#{Date.today.strftime('%m-%d')}".freeze

def parse_options
  options = {}
  opt_parser = OptionParser.new do |opts|
    opts.banner = <<-USAGE
  Usage: sync-codeorg-all [options]

  Commands:
    in:    Pull all updated source strings into i18n/locales/sources
    up:    Upload i18n/locales/sources to crowdin
    down:  Download translations from crowdin into i18n/locales
    out:   Distribute translations from i18n/locales out into codebase

  Options:
    USAGE

    opts.on("-i", "--interactive", "Run through complete sync interactively") do
      options[:interactive] = true
    end

    opts.on("-c", "--command COMMAND", %w(in up down out), "Run a single sync command") do |cmd|
      options[:command] = cmd
    end

    opts.on("-p", "--with-pull-request", "Automatically generate pull requests") do
      options[:with_pull_request] = true
    end
  end
  opt_parser.parse!(ARGV)

  unless options[:interactive] || options[:command]
    puts "  ERROR: Must specify either interactive or command mode\n\n"
    puts opt_parser.help
    exit(1)
  end

  options
end

def create_in_up_pr
  return unless should_i "create the in & up PR"
  `git checkout -B #{IN_UP_BRANCH}`

  git_add_and_commit(
    [
      "dashboard/config/locales/*.en.yml",
      "i18n/locales/source/dashboard"
    ],
    "dashboard i18n sync"
  )

  git_add_and_commit(
    [
      "i18n/locales/source/pegasus",
    ],
    "pegasus i18n sync"
  )

  git_add_and_commit(
    [
      "i18n/locales/source/blockly-mooc",
    ],
    "apps i18n sync"
  )

  `git push origin #{IN_UP_BRANCH}`
  in_up_pr = GitHub.create_pull_request(
    base: 'staging',
    head: IN_UP_BRANCH,
    title: "I18n sync In & Up #{Date.today.strftime('%m/%d')}"
  )
  GitHub.label_pull_request(in_up_pr, ["i18n"])
  puts "Created In & Up PR: #{GitHub.url(in_up_pr)}"
end

def create_down_out_pr
  return unless should_i "create the down & out PR"
  `git checkout -B #{DOWN_OUT_BRANCH}`

  git_add_and_commit(
    [
      "pegasus/cache",
      "i18n/locales/*/pegasus",
    ],
    "pegasus i18n updates"
  )

  git_add_and_commit(
    [
      "dashboard/config/locales/*.yml",
      "i18n/locales/*/dashboard",
    ],
    "dashboard i18n updates"
  )

  git_add_and_commit(
    [
      "apps/i18n/*/*.json",
      "i18n/locales/*/blockly-mooc",
    ],
    "apps i18n updates"
  )

  git_add_and_commit(
    [
      "apps/lib/blockly/*.js",
      "i18n/locales/*/blockly-core",
    ],
    "blockly i18n updates"
  )

  `git push origin #{DOWN_OUT_BRANCH}`
  down_out_pr = GitHub.create_pull_request(
    base: IN_UP_BRANCH,
    head: DOWN_OUT_BRANCH,
    title: "I18n sync Down & Out #{Date.today.strftime('%m/%d')}"
  )
  GitHub.label_pull_request(down_out_pr, ["i18n"])

  puts "Created Down & Out PR: #{GitHub.url(down_out_pr)}"

  # TODO: automate blockly update, too
  puts "\r\rremember to update blockly\r\r"
end

def main
  options = parse_options

  if options[:interactive]
    sync_in if should_i "sync in"
    sync_up if should_i "sync up"
    create_in_up_pr if options[:with_pull_request]
    sync_down if should_i "sync down"
    sync_out if should_i "sync out"
    create_down_out_pr if options[:with_pull_request]
  elsif options[:command]
    case options[:command]
    when 'in'
      puts "Pulling all updated source strings into i18n/locales/sources"
      sync_in
      if options[:with_pull_request]
        create_in_up_pr
      end
    when 'up'
      puts "Uploading i18n/locales/sources to crowdin"
      sync_up
    when 'down'
      puts "Downloading translations from crowdin into i18n/locales"
      sync_down
    when 'out'
      puts "Distributing translations from i18n/locales out into codebase"
      sync_out
      if options[:with_pull_request]
        create_down_out_pr
      end
    end
  end
end

main if __FILE__ == $0 && only_one_running?(__FILE__)
