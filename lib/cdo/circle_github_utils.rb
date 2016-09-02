require 'json'
require 'open-uri'
require 'octokit'
require_relative './git_utils'
require_relative './github_utils'

module CircleGitHubUtils
  def self.add_current_pr_comment(github_markdown_body)
    client = Octokit::Client.new(:access_token => ENV['GITHUB_PR_COMMENT_TOKEN'])
    client.add_comment('code-dot-org/code-dot-org', circle_github_pr, github_markdown_body)
  end

  def self.pr_base_branch_or_default_no_origin
    circle_pr_branch_base_no_origin || GitUtils.current_branch_base_no_origin
  end

  def self.circle_pr_branch_base_no_origin
    pr_number = circle_github_pr.gsub('https://github.com/code-dot-org/code-dot-org/pull/', '')
    GitHubUtils.base_for_pr(pr_number)
  end

  def self.circle_github_pr
    ENV['CI_PULL_REQUEST']
  end
end
