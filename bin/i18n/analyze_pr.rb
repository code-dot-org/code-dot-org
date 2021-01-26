#!/usr/bin/env ruby

require_relative '../../deployment'
require 'optparse'
require 'cdo/github'

def find_open_i18n_prs
  query = "is:pr is:open label:i18n"
  find_issues(query)
end

def find_recent_i18n_prs(day_count = 14)
  cutoff_date = (DateTime.now.to_date - day_count.days).iso8601
  query = "is:pr label:i18n created:>=#{cutoff_date}"
  find_issues(query)
end

def find_issues(query)
  res = Octokit.search_issues("repo:#{GitHub::REPO} #{query}")
  puts "Found #{res[:total_count]} PR(s) match the search query '#{query}'"
  res[:items].each do |item|
    puts("##{item[:number]}: #{item[:title]}")
    puts "  + State: #{item[:state]}"
    puts "  + Created_at: #{item[:created_at]}"
    puts("  + Open in browser: #{item[:html_url]}")
  end
  nil
end

def analyze_pr_files(pr_number, file_count)
  files = get_pr_files(pr_number)
  top_files = files.sort {|a, b| -(a[:changes] <=> b[:changes])}.first(file_count)
  reports = top_files.map do |file|
    "- `#{file[:filename]}`, #{file[:changes]} changes (#{file[:additions]} additions, #{file[:deletions]}) deletions."
  end

  "Top #{[file_count, files.length].min}/#{files.length} " \
    "files sorted by the number of changes:\n" +
    reports.join("\n")
end

def analyze_pr_commits(pr_number, commit_count)
  commits = get_pr_commits(pr_number)
  top_commits = commits.sort {|a, b| -(a[:total] <=> b[:total])}.first(commit_count)
  reports = top_commits.map do |commit|
    top_file = commit[:files].max_by {|f| f[:changes]}
    "- Commit: #{commit[:message]}\n" \
      "  - #{commit[:total]} changes (#{commit[:additions]} additions, #{commit[:deletions]} deletions).\n" \
      "  - #{commit[:file_count]} files changed.\n" \
      "  - File with the most changes: `#{top_file[:filename]}`, " \
      "#{top_file[:changes]} changes (#{top_file[:additions]} additions, #{top_file[:deletions]} deletions)."
  end

  "Top #{[commit_count, commits.length].min}/#{commits.length} " \
    "commits sorted by the number of changes:\n" +
    reports.join("\n")
end

def analyze_pr(pr_number, file_count = 5, commit_count = 5)
  puts "Analyzing PR files..."
  file_reports = analyze_pr_files pr_number, file_count

  puts "Analyzing PR commits..."
  commit_reports = analyze_pr_commits pr_number, commit_count

  file_reports + "\n\n" + commit_reports
end

# Get files https://api.github.com/repos/code-dot-org/code-dot-org/pulls/38180/files
def get_pr_files(pr_number)
  Octokit.auto_paginate = true
  files = Octokit.pull_request_files(GitHub::REPO, pr_number)
  files.map do |file|
    {
      filename: file[:filename],
      status: file[:status],
      changes: file[:changes],
      additions: file[:additions],
      deletions: file[:deletions]
    }
  end
end

# Get commits https://api.github.com/repos/code-dot-org/code-dot-org/pulls/38180/commits
def get_pr_commits(pr_number)
  large_commit_count = 10
  Octokit.auto_paginate = true

  commits = Octokit.pull_request_commits GitHub::REPO, pr_number
  if commits.length >= large_commit_count
    puts "Sending #{commits.length} requests to GitHub APIs (1 request per commit), it may take a while..."
  end

  [].tap do |all_commit_details|
    commits.each do |commit|
      if commits.length >= large_commit_count
        puts "Querying commit \"#{commit[:commit][:message]}\"..."
      end
      all_commit_details << get_commit(commit[:sha])
    end
  end
end

# E.g. https://api.github.com/repos/code-dot-org/code-dot-org/commits/2de21ccf814ee851522b2a559e0e61edd5655f80
# https://api.github.com/repos/code-dot-org/code-dot-org/commits/4bee436ef72321894465fe9f8f32f489b1dcfcc4
def get_commit(commit_sha)
  commit = Octokit.commit GitHub::REPO, commit_sha
  commit_details = {
    sha: commit_sha,
    message: commit[:commit][:message],
    total: commit[:stats][:total],
    additions: commit[:stats][:additions],
    deletions: commit[:stats][:deletions],
    file_count: commit[:files].length,
    parent_count: commit[:parents].length,
    files: [],
    html_url: commit[:html_url],
  }

  commit[:files].each do |file|
    commit_details[:files] << {
      filename: file[:filename],
      status: file[:status],
      changes: file[:changes],
      additions: file[:additions],
      deletions: file[:deletions]
    }
  end

  commit_details
end

def add_pr_comment(pr_number, message)
  puts "Adding a comment to PR #{pr_number}..."
  Octokit.add_comment GitHub::REPO, pr_number, message
  puts "Done."
end

# Read arguments from the command line
def parse_option(args)
  options = {}
  OptionParser.new do |opt_parser|
    opt_parser.banner = "Usage: #{File.basename(__FILE__)} [options]"

    opt_parser.on('-f', '--find', 'Find i18n open PRs') do
      options[:find_prs] = true
    end

    opt_parser.on('-p', '--pr [number]', Integer, 'Pull request number') do |pr_number|
      options[:pr_number] = pr_number
    end

    opt_parser.on('-c', '--comment', 'Add comment to PR') do
      options[:add_comment] = true
    end

    opt_parser.on('-h', '--help', 'Prints this help') do
      puts opt_parser
      exit
    end
  end.parse! args
  options
end

def main
  parse_option(ARGV).tap do |options|
    # puts "options = #{options}"
    if options[:find_prs]
      if options[:pr_number] || options[:add_comment]
        puts "WARNING: -f option is selected, -p and -c options will be ignored."
      end
      GitHub.configure_octokit
      find_open_i18n_prs
    elsif options[:pr_number]
      GitHub.configure_octokit
      result = analyze_pr options[:pr_number]
      puts result

      if options[:add_comment]
        instruction = "This comment is created by running: `bin/i18n/analyze_pr.rb -p #{options[:pr_number]} -c`\n\n"
        add_pr_comment options[:pr_number], instruction + result
      end
    else
      puts "ERROR: Invalid or missing arguments. Use -h option for help."
    end
  end
end

main
