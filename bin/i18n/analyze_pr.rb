# Demo steps
# In rails console
# load '../bin/i18n/analyze_pr.rb';
# configure_octokit
# find_open_i18n_prs
# find_recent_i18n_prs
# find_recent_i18n_prs 31
# analyze_pr 38180
# analyze_pr 38082

# Test in rails console:
# load '../bin/i18n/analyze_pr.rb'; analyze_pr(38180);
# load '../bin/i18n/analyze_pr.rb'; analyze_pr(38146);
# load '../bin/i18n/analyze_pr.rb'; analyze_pr(38082);
# load '../bin/i18n/analyze_pr.rb'; get_pr_commits
# load '../bin/i18n/analyze_pr.rb'; find_open_i18n_prs
# load '../bin/i18n/analyze_pr.rb'; find_recent_i18n_prs

# PR_NUMBER = 38180 #38082

def configure_octokit
  Octokit.configure do |client|
    client.access_token = CDO.github_access_token
  end
end

def find_open_i18n_prs
  query = "is:pr is:open label:i18n"
  find_issues(query)
end

def find_recent_i18n_prs(lookback_days = 14)
  cutoff_date = (DateTime.now.to_date - lookback_days.days).iso8601
  query = "is:pr label:i18n created:>=#{cutoff_date}"
  find_issues(query)
end

def find_issues(query)
  res = Octokit.search_issues("repo:#{GitHub::REPO} #{query}")
  puts "Found #{res[:total_count]} results matched the search query '#{query}'"
  res[:items].each do |item|
    puts("\tPR #{item[:number]}: #{item[:title]}")
    puts "\t\tstate: #{item[:state]}"
    puts "\t\tcreated_at: #{item[:created_at]}"
    puts("\t\topen in web browser: #{item[:html_url]}")
  end
  nil
end

def analyze_pr(pr_number)
  pr = get_pr(pr_number)
  puts "PR #{pr[:number]}: #{pr[:title]}"
  puts "\topen in browser: #{pr[:html_url]}"
  puts "\tstate: #{pr[:state]}"
  puts "\tcreated_at: #{pr[:created_at]}"
  puts "\tlabels: #{pr[:labels]}"
  puts "\tcommits: #{pr[:commits]}"
  puts "\tadditions: #{pr[:additions]}"
  puts "\tdeletions: #{pr[:deletions]}"
  puts "\tchanged_files: #{pr[:changed_files]}"

  max_file = 5
  puts "Top #{max_file} files sorted by number of changes:"
  files = get_pr_files(pr_number)
  top_files = files.sort {|a, b| -(a[:changes] <=> b[:changes])}.first(max_file)
  top_files.each do |file|
    puts "\t#{file[:filename]}"
    puts "\t\tstatus: #{file[:status]}"
    puts "\t\tchanges: #{file[:changes]}"
    puts "\t\tadditions: #{file[:additions]}"
    puts "\t\tdeletions: #{file[:deletions]}"
  end

  max_commit = 5
  puts "Top #{max_commit} commits sorted by number of changes:"
  puts "(Sending #{pr[:commits]} requests to GitHub APIs, 1 request per commit...)"
  commits = get_pr_commits(pr_number)
  top_commits = commits.sort {|a, b| -(a[:total] <=> b[:total])}.first(max_commit)
  top_commits.each do |commit|
    puts "\t#{commit[:sha]}: #{commit[:message]}"
    puts "\t\topen in browser: #{commit[:html_url]}"
    puts "\t\ttotal changes: #{commit[:total]}"
    puts "\t\tadditions: #{commit[:additions]}"
    puts "\t\tdeletions: #{commit[:deletions]}"
    puts "\t\tchanged files: #{commit[:file_count]}"
    top_file = commit[:files].max {|f| f[:changes]}
    puts "\t\tfile with the most changes: #{top_file[:filename]}"
    puts "\t\t\tstatus: #{top_file[:status]}"
    puts "\t\t\tchanges: #{top_file[:changes]}"
    puts "\t\t\tadditions: #{top_file[:additions]}"
    puts "\t\t\tdeletions: #{top_file[:deletions]}"
  end

  nil
end

# Get a PR https://api.github.com/repos/code-dot-org/code-dot-org/pulls/38180
def get_pr(pr_number)
  pr = Octokit.pull_request(GitHub::REPO, pr_number)
  {
    number: pr[:number],
    title: pr[:title],
    state: pr[:state],
    created_at: pr[:created_at],
    labels: pr[:labels]&.map {|label| label[:name]},
    commits: pr[:commits],
    additions: pr[:additions],
    deletions: pr[:deletions],
    changed_files: pr[:changed_files],
    html_url: pr[:html_url]
  }
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
  Octokit.auto_paginate = true
  commits = Octokit.pull_request_commits(GitHub::REPO, pr_number)
  all_commit_details = []
  commits.each do |commit|
    all_commit_details << get_commit(commit[:sha])
  end
  all_commit_details
end

# E.g. https://api.github.com/repos/code-dot-org/code-dot-org/commits/2de21ccf814ee851522b2a559e0e61edd5655f80
def get_commit(commit_sha)
  commit = Octokit.commit(GitHub::REPO, commit_sha)
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
