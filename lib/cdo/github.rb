require 'cdo/chat_client'
require 'net/http'
require 'octokit'

# This module serves as a thin wrapper around Octokit, itself a wrapper around
# the GitHub API.
module GitHub
  REPO = "code-dot-org/code-dot-org".freeze

  # Configures Octokit with our GitHub access token.
  def self.configure_octokit
    raise unless CDO.github_access_token
    Octokit.configure do |client|
      client.access_token = CDO.github_access_token
    end
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#create_pull_request-instance_method
  # @param base [String] The base branch of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @param title [String] The title of the requested pull request.
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  def self.create_pull_request(base:, head:, title:)
    configure_octokit
    response = Octokit.create_pull_request(REPO, base, head, title)

    response['number']
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#merge_pull_request-instance_method
  # @param pr_number [Integer] The PR number to be merged.
  # @return [Boolean] Whether the PR was merged.
  def self.merge_pull_request(pr_number)
    if pull_merged?(pr_number)
      raise ArgumentError.new("PR\##{pr_number} is already merged")
    end
    configure_octokit
    response = Octokit.merge_pull_request(REPO, pr_number)
    response['merged']
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#pull_merged
  # @param pr_number [Integer] The number of the pull request to check.
  # @return [Boolean] Whether the pull request has been merged.
  def self.pull_merged?(pr_number)
    Octokit.pull_merged?(REPO, pr_number)
  end
end
