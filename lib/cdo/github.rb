require 'net/http'
require 'octokit'

require_relative '../../deployment'

# This module serves as a thin wrapper around Octokit, itself a wrapper around
# the GitHub API.
module GitHub
  REPO = "code-dot-org/code-dot-org".freeze
  DASHBOARD_DB_DIR = 'dashboard/db/'.freeze
  PEGASUS_DB_DIR = 'pegasus/migrations/'.freeze
  STAGING_BRANCH = 'staging'.freeze
  STAGING_NEXT_BRANCH = 'staging-next'.freeze
  STATUS_SUCCESS = 'success'.freeze
  STATUS_FAILURE = 'failure'.freeze
  STATUS_CONTEXT = 'DTS'.freeze
  STATUS_CONTEXT_DTSN = 'DTSN'.freeze

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

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#pull_request_files-instance_method
  # @param pr_number [Integer] The PR number to query.
  # @return [Array[String]] The filenames part of the pull request living in the dashboard or
  #   pegasus migrations subdirectory.
  def self.database_changes(pr_number)
    # For pagination documentation, see https://github.com/octokit/octokit.rb#pagination.
    Octokit.auto_paginate = true

    response = Octokit.pull_request_files(REPO, pr_number)

    filenames = response.map {|resource| resource[:filename]}
    filenames.select do |filename|
      (filename.start_with? DASHBOARD_DB_DIR) || (filename.start_with? PEGASUS_DB_DIR)
    end
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#create_pull_request-instance_method
  # @param base [String] The base branch of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @param title [String] The title of the requested pull request.
  # @param body [String] The body for the pull request (optional). Supports GFM.
  # @raise [Exception] From calling Octokit.create_pull_request.
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  def self.create_pull_request(base:, head:, title:, body: nil)
    configure_octokit
    response = Octokit.create_pull_request(REPO, base, head, title, body)

    response['number']
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/Issues.html#update_issue-instance_method
  # @param base [String | Integer] the numeric id of the PR to be updated
  # @param lables [Array[String]] array of strings to be set as new labels for the PR
  # @raise [Exception] From calling Octokit.create_pull_request.
  # @return [Array[String]] the resulting labels for the PR
  def self.label_pull_request(id, labels)
    configure_octokit
    response = Octokit.update_issue(REPO, id, {labels: labels})

    response['labels'].map {|label| label[:name]}
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/PullRequests.html#merge_pull_request-instance_method
  # @param pr_number [Integer] The PR number to be merged.
  # @param commit_message [String] The message to add to the commit
  # @raise [ArgumentError] If the PR has already been merged.
  # @raise [Exception] From calling Octokit.merge_pull_request.
  # @return [Boolean] Whether the PR was merged.
  def self.merge_pull_request(pr_number, commit_message='')
    configure_octokit

    # Let async mergeability check finish before proceeding.
    #   The value of the mergeable attribute can be true, false, or null. If the
    #   value is null, this means that the mergeability hasn't been computed
    #   yet, and a background job was started to compute it. Give the job a few
    #   moments to complete, and then submit the request again. When the job is
    #   complete, the response will include a non-null value for the mergeable
    #   attribute.
    # Source: https://developer.github.com/v3/pulls/#get-a-single-pull-request
    pr = nil
    attempt_count = 0
    loop do
      pr = Octokit.pull_request(REPO, pr_number)
      attempt_count += 1
      break unless pr['mergeable'].nil? && attempt_count < 30
      sleep 1
    end

    if attempt_count >= 30
      raise ArgumentError.new("PR\##{pr_number} mergeability check timed out")
    elsif pr['merged']
      raise ArgumentError.new("PR\##{pr_number} is already merged")
    elsif !pr['mergeable']
      raise ArgumentError.new("PR\##{pr_number} is not mergeable")
    end
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
  #   or nil if unsuccessful or unnecessary.
  def self.create_and_merge_pull_request(base:, head:, title:)
    return nil unless behind?(base: head, compare: base)
    pr_number = create_pull_request(base: base, head: head, title: title)
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
  # @param compare [String] The comparison branch to compare.
  # @return [Boolean] Whether compare is behind base, i.e., whether compare is missing
  #   commits in base.
  def self.behind?(base:, compare:)
    response = Octokit.compare(REPO, base, compare)
    response.behind_by > 0
  rescue Octokit::InternalServerError
    # This can happen for comparisons with extremely large diffs. See https://developer.github.com/v3/repos/commits/#compare-two-commits
    # In this case, we can safely assume that we are indeed behind, since there
    # otherwise would not be a diff to break on
    true
  end

  # Octokit Documentation: http://octokit.github.io/octokit.rb/Octokit/Client/Repositories.html#branch-instance_method
  # @param branch [String] The name of the branch.
  # @raise [Octokit::NotFound] If the specified branch does not exist.
  # @return [String] The sha hash (abbreviated to eight characters) of the most
  #   recent commit to branch.
  def self.sha(branch, authenticate_api_request = false)
    configure_octokit if authenticate_api_request
    response = Octokit.branch(REPO, branch)
    response.commit.sha[0..7]
  end

  # Opens a browser URL with a candidate pull request merging head into base.
  # @param base [String] The base branch of the comparison.
  # @param head [String] The head branch of the comparison.
  # @param title [String] The title of the candidate pull request.
  # @raise [RuntimeError] If the environment is not development.
  def self.open_pull_request_in_browser(base:, head:, title:)
    open_url "https://github.com/#{REPO}/compare/#{base}...#{head}"\
      "?expand=1&title=#{CGI.escape title}"
  end

  def self.open_url(url)
    raise "GitHub.open_url called on non-dev environment" unless rack_env?(:development)
    # Based on http://stackoverflow.com/a/14053693/5000129
    if RbConfig::CONFIG['host_os'] =~ /linux|bsd/
      system "sensible-browser \"#{url}\""
    else
      system "open \"#{url}\""
    end
  end

  def self.set_dts_check_pass(pull)
    Octokit.create_status(
      pull['base']['repo']['full_name'],
      pull['head']['sha'],
      STATUS_SUCCESS,
      context: STATUS_CONTEXT,
      description: 'The staging branch is open.'
    )
  end

  def self.set_all_dts_check_pass
    configure_octokit
    Octokit.pulls(REPO, base: STAGING_BRANCH)
    paged_for_each(Octokit.last_response) do |pull|
      set_dts_check_pass(pull)
    end
  end

  def self.set_dts_check_fail(pull)
    Octokit.create_status(
      pull['base']['repo']['full_name'],
      pull['head']['sha'],
      STATUS_FAILURE,
      context: STATUS_CONTEXT,
      description: 'The staging branch is closed. Check #developers.'
    )
  end

  def self.set_all_dts_check_fail
    configure_octokit
    Octokit.pulls(REPO, base: STAGING_BRANCH)
    paged_for_each(Octokit.last_response) do |pull|
      set_dts_check_fail(pull)
    end
  end

  def self.set_dtsn_check_pass(pull)
    Octokit.create_status(
      pull['base']['repo']['full_name'],
      pull['head']['sha'],
      STATUS_SUCCESS,
      context: STATUS_CONTEXT_DTSN,
      description: 'The staging-next branch is open.'
    )
  end

  def self.set_all_dtsn_check_pass
    configure_octokit
    Octokit.pulls(REPO, base: STAGING_NEXT_BRANCH)
    paged_for_each(Octokit.last_response) do |pull|
      set_dtsn_check_pass(pull)
    end
  end

  def self.set_dtsn_check_fail(pull)
    Octokit.create_status(
      pull['base']['repo']['full_name'],
      pull['head']['sha'],
      STATUS_FAILURE,
      context: STATUS_CONTEXT_DTSN,
      description: 'The staging-next branch is closed. Check #developers.'
    )
  end

  def self.set_all_dtsn_check_fail
    configure_octokit
    Octokit.pulls(REPO, base: STAGING_NEXT_BRANCH)
    paged_for_each(Octokit.last_response) do |pull|
      set_dtsn_check_fail(pull)
    end
  end

  # Iterate over a paged resource, given the first response
  def self.paged_for_each(response)
    loop do
      resources = response.data
      resources.each {|resource| yield(resource)}
      break unless response.rels[:next]
      response = response.rels[:next].get
    end
  end

  def self.get_date_for_commit(commit_sha)
    return Octokit.commit(REPO, commit_sha)[:commit][:author][:date]
  end
end
