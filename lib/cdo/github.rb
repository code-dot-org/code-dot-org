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
  # @raise [Exception] From calling Octokit.create_pull_request.
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  def self.create_pull_request(base:, head:, title:)
    configure_octokit
    response = Octokit.create_pull_request(REPO, base, head, title)

    response['number']
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#merge_pull_request-instance_method
  # @param pr_number [Integer] The PR number to be merged.
  # @raise [ArgumentError] If the PR has already been merged.
  # @raise [Exception] From calling Octokit.merge_pull_request.
  # @return [Boolean] Whether the PR was merged.
  def self.merge_pull_request(pr_number)
    if pull_merged?(pr_number)
      raise ArgumentError.new("PR\##{pr_number} is already merged")
    end
    configure_octokit
    response = Octokit.merge_pull_request(REPO, pr_number)
    response['merged']
  end

  # Creates and merges a pull request.
  # @param base [String] The base branch of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @param title [String] The title of the requested pull request.
  # @raise [Exception] From calling create_pull_request and merge_pull_request.
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  #   or nil if unsuccessful.
  def self.create_and_merge_pull_request(base:, head:, title:)
    pr_number = create_pull_request(base: base, head: head, title: title)
    success = merge_pull_request(pr_number)
    success ? pr_number : nil
  end

  # Builds the HTML URL from a pull request number. Does not validate the pull
  # request number.
  # @param pr_number [Integer] The pull request number.
  # @return [String] The HTML URL for the pull request.
  def self.html_url(pr_number)
    "https://github.com/#{REPO}/pull/#{pr_number}"
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#pull_merged
  # @param pr_number [Integer] The number of the pull request to check.
  # @raise [Exception] From calling Octokit.pull_merged?.
  # @return [Boolean] Whether the pull request has been merged.
  def self.pull_merged?(pr_number)
    Octokit.pull_merged?(REPO, pr_number)
  end
end
