require 'json'
require 'open-uri'
require_relative './git_utils'

# Utilities which make assumptions that we're using GitHub, hit GitHub APIs, etc.
module GitHubUtils
  REPO_API_BASE = 'https://api.github.com/repos/code-dot-org/code-dot-org'

  def self.get_latest_commit_merged_branch
    get_branch_commit_merges(GitUtils.git_revision)
  end

  def self.base_for_pr(pr_number)
    pr_json = JSON.parse(open("#{REPO_API_BASE}/pulls/#{pr_number}").read)
    pr_json['base']['ref']
  rescue => _
    nil
  end

  # Finds the branch name this is a GitHub-generated PR merge commit for
  def self.get_branch_commit_merges(commit)
    commit_json = JSON.parse(open("#{REPO_API_BASE}/commits/#{commit}").read)
    commit_json['commit']['message'].match(/from code-dot-org\/(.*)\n\n/)[1]
  rescue => _
    nil
  end
end
