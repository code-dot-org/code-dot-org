require 'json'
require 'open-uri'
require_relative './git_utils'

# Utilities which make assumptions that we're using GitHub, hit GitHub APIs, etc.
module GitHubUtils
  GH_REPO = 'code-dot-org/code-dot-org'
  REPO_API_BASE = "https://api.github.com/repos/#{GH_REPO}"

  def self.add_pr_comment(pr_num, github_markdown_body)
    octokit_client.add_comment(GH_REPO, pr_num, github_markdown_body)
  end

  def self.get_latest_commit_merged_branch
    get_branch_commit_merges(GitUtils.git_revision)
  end

  def self.get_latest_commit_merged_pr
    get_pr_commit_merges(GitUtils.git_revision)
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

  # Finds the branch name this is a GitHub-generated PR merge commit for
  def self.get_pr_commit_merges(commit)
    client.commit(GH_REPO, commit).commit.message.match(/\#(\d+) from code-dot-org/)[1]
    commit_json = JSON.parse(open("#{REPO_API_BASE}/commits/#{commit}").read)
    commit_json['commit']['message'].match(/\#(\d+) from code-dot-org/)[1]
  rescue => _
    nil
  end

  def self.octokit_client
    $octokit_client ||= Octokit::Client.new(:access_token => ENV['GITHUB_PR_COMMENT_TOKEN'])
  end
end
