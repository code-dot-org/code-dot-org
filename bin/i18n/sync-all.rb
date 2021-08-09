#!/usr/bin/env ruby
require_relative '../../lib/cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

# If run with the "interactive" flag, runs all steps necessary for a full i18n
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

require_relative '../../deployment'

require_relative 'i18n_script_utils'

require_relative 'sync-in'
require_relative 'sync-up'
require_relative 'sync-down'
require_relative 'sync-out'
require_relative 'create-prs'

require 'optparse'

class I18nSync
  def initialize(args)
    @options = parse_options(args)
  end

  def run
    if @options[:interactive]
      return_to_staging_branch
      sync_in if should_i "sync in"
      sync_up if should_i "sync up"
      CreateI18nPullRequests.in_and_up if @options[:with_pull_request] && should_i("create the in & up PR")
      sync_down if should_i "sync down"
      sync_out(true) if should_i "sync out"
      CreateI18nPullRequests.down_and_out if @options[:with_pull_request] && should_i("create the down & out PR")
      return_to_staging_branch
    elsif @options[:command]
      case @options[:command]
      when 'in'
        puts "Pulling all updated source strings into i18n/locales/sources"
        sync_in
        if @options[:with_pull_request] && should_i("create the in & up PR")
          CreateI18nPullRequests.in_and_up
        end
      when 'up'
        puts "Uploading i18n/locales/sources to crowdin"
        sync_up
      when 'down'
        puts "Downloading translations from crowdin into i18n/locales"
        sync_down
      when 'out'
        puts "Distributing translations from i18n/locales out into codebase"
        sync_out(true)
        if @options[:with_pull_request] && should_i("create the down & out PR")
          CreateI18nPullRequests.down_and_out
        end
      when 'return-to-staging'
        return_to_staging_branch
      end
    end
  end

  private

  def parse_options(args)
    options = {}
    opt_parser = OptionParser.new do |opts|
      opts.banner = <<-USAGE
  Usage: sync-all [options]

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

      opts.on("-c", "--command COMMAND", %w(in up down out return-to-staging), "Run a single sync command") do |cmd|
        options[:command] = cmd
      end

      opts.on("-p", "--with-pull-request", "Automatically generate pull requests") do
        options[:with_pull_request] = true
      end

      opts.on("-y", "--yes", "Run without confirmation") do
        options[:yes] = true
      end
    end
    opt_parser.parse!(args)

    unless options[:interactive] || options[:command]
      puts "  ERROR: Must specify either interactive or command mode\n\n"
      puts opt_parser.help
      exit(1)
    end

    options
  end

  def should_i(question)
    return true if @options[:yes]

    loop do
      print "Should I #{question}? [Yes]/Skip/Quit: "
      response = gets.strip.downcase
      puts ''
      if 'yes'.start_with?(response) # also catches blank/return ;)
        return true
      elsif 'skip'.start_with?(response) || 'no'.start_with?(response)
        return false
      elsif 'quit'.start_with?(response)
        puts "quitting"
        exit(-1)
      else
        puts "Sorry, I didn't understand that.\n\n"
      end
    end
  end

  def return_to_staging_branch
    case GitUtils.current_branch
    when "staging"
      # If we're already on staging, we don't need to bother
      return
    when /^i18n-sync/
      # If we're on an i18n sync branch, only return to staging if the branch
      # has been merged.
      return unless GitUtils.current_branch_merged_into? "origin/staging"
    else
      # If we're on some other branch, then we're in some kind of weird state,
      # so error out.
      raise "Tried to return to staging branch from unknown branch #{GitUtils.current_branch.inspect}"
    end
    `git checkout staging` if should_i "switch to staging branch"
  rescue => e
    puts "return_to_staging_branch failed from the error: #{e}"
    raise e
  end
end

I18nSync.new(ARGV).run
