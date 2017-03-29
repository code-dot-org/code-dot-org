require 'net/http'
require 'octokit'

require_relative '../../deployment'

# This module serves as a thin wrapper around Octokit, itself a wrapper around
# the GitHub API.
module GitHub
  REPO = "code-dot-org/code-dot-org".freeze

  # Configures Octokit with our GitHub access token.
  # @raise [RuntimeError] If CDO.github_access_token is not defined.
  def self.configure_octokit
    unless CDO.github_access_token
      raise "CDO.github_access_token undefined"
    end
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
  # @param commit_message [String] The message to add to the commit
  # @raise [ArgumentError] If the PR has already been merged.
  # @raise [Exception] From calling Octokit.merge_pull_request.
  # @return [Boolean] Whether the PR was merged.
  def self.merge_pull_request(pr_number, commit_message='')
    if pull_merged?(pr_number)
      raise ArgumentError.new("PR\##{pr_number} is already merged")
    end
    configure_octokit
    response = Octokit.merge_pull_request(REPO, pr_number, commit_message)
    response['merged']
  end

  # Creates and merges a pull request.
  # @param base [String] The base branch of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @param title [String] The title of the requested pull request.
  # @raise [Exception] From calling create_pull_request and merge_pull_request.
  # @example For a DTT:
  #   create_and_merge_pull_request(base: 'test', head: 'staging', title: 'DTT')
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  #   or nil if unsuccessful.
  def self.create_and_merge_pull_request(base:, head:, title:)
    pr_number = create_pull_request(base: base, head: head, title: title)
    # By sleeping, we allow GitHub time to determine that a merge conflict is
    # not present. Otherwise, empirically, we receive a 405 response error.
    sleep 3
    success = merge_pull_request(pr_number, title)
    success ? pr_number : nil
  end

  # Builds the GitHub URL from a pull request number. Does not validate the pull
  # request number.
  # @param pr_number [Integer] The pull request number.
  # @return [String] The HTML URL for the pull request.
  def self.url(pr_number)
    "https://github.com/#{REPO}/pull/#{pr_number}"
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#pull_merged
  # @param pr_number [Integer] The number of the pull request to check.
  # @raise [Exception] From calling Octokit.pull_merged?.
  # @return [Boolean] Whether the pull request has been merged.
  def self.pull_merged?(pr_number)
    Octokit.pull_merged?(REPO, pr_number)
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/Commits.html#compare-instance_method
  # @param base [String] The base branch of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @raise [Exception] From calling Octokit.compare.
  # @example For a DTT, compare(base: 'test', head: 'staging').
  # @return [Array[String]] The commit messages of all commits between base and
  #   head.
  def self.compare(base:, head:)
    base_sha = sha(base)
    head_sha = sha(head)

    response = Octokit.compare(REPO, base_sha, head_sha)
    response.commits.map(&:commit).map(&:message)
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/Commits.html#compare-instance_method
  # @param base [String] The base branch to compare against.
  # @param compare [String] The comparison brnach to compare.
  # @raise [Exception] From calling Octokit.compare.
  # @return [Boolean] Whether compare is behind base, i.e., whether compare is missing
  #   commits in base.
  def self.behind?(base:, compare:)
    response = Octokit.compare(REPO, base, compare)
    response.behind_by > 0
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/Repositories.html#branch-instance_method
  # @param branch [String] The name of the branch.
  # @raise [Octokit::NotFound] If the specified branch does not exist.
  # @return [String] The sha hash (abbreviated to eight characters) of the most
  #   recent commit to branch.
  def self.sha(branch)
    response = Octokit.branch(REPO, branch)
    response.commit.sha[0, 7]
  end

  # Opens a browser URL with a candidate pull request merging head into base.
  # @param base [String] The base branch of the comparison.
  # @param head [String] The head branch of the comparison.
  # @param title [String] The title of the candidate pull request.
  # @raise [RuntimeError] If the environment is not development.
  def self.open_pull_request_in_browser(base:, head:, title:)
    unless rack_env?(:development)
      raise "GitHub.open_pull_request_in_browser called on non-dev environment"
    end
    open_url "https://github.com/#{REPO}/compare/#{base}...#{head}"\
      "?expand=1&title=#{CGI.escape title}"
  end

  private_class_method def self.open_url(url)
    # Based on http://stackoverflow.com/a/14053693/5000129
    if RbConfig::CONFIG['host_os'] =~ /linux|bsd/
      system "sensible-browser \"#{url}\""
    else
      system "open \"#{url}\""
    end
  end
end
