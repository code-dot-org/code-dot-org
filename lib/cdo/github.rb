require 'cdo/chat_client'
require 'net/http'

# This module serves as a wrapper around the GitHub API, offering convenience
# methods for pull request functionality
module GitHub
  PULL_API_BASE = 'https://api.github.com/repos/code-dot-org/code-dot-org/pulls'.freeze

  # GitHub API: https://developer.github.com/v3/pulls/#create-a-pull-request
  # @param title [String] The title of the requested pull request.
  # @param head [String] The head branch of the requested pull request.
  # @param base [String] The base branch of the requested pull request.
  # @return [nil | Integer] The PR number of the newly created DTT if successful
  #   or nil if unsuccessful.
  def self.create_pull_request(title:, head:, base:)
    params = {
      title: title,
      head: head,
      base: base
    }

    uri = URI.parse PULL_API_BASE
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(uri.request_uri)
    request['Authorization'] = "token #{CDO.github_access_token}"
    request.body = params.to_json
    response = http.request(request)

    return nil if response.code != '201'

    response_body = JSON.parse(response.body)
    response_body['number']
  end

  # GitHub API: https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button
  # @param pr_number [Integer] The PR number to be merged.
  # @return [Boolean] Whether the PR was merged.
  def self.merge_pull_request(pr_number)
    if merged?(pr_number)
      raise ArgumentError("PR#{pr_number} is already merged")
    end

    uri = URI.parse "{PULL_API_BASE}/{#pr_number}/merge"
    http = Net::HTTP.new uri.host, uri.port
    http.use_ssl = true
    request = Net::HTTP::Put.new(uri.request_uri)
    request['Authorization'] = "token #{CDO.github_access_token}"
    response = http.request(request)

    response.code == '200'
  end

  # @param pr_number [Integer] The number of the pull request to check.
  # @return [Boolean] Whether the pull request has been merged.
  def self.merged?(pr_number)
    uri = URI.parse "#{PULL_API_BASE}/#{pr_number}/merge"
    http = Net::HTTP.new uri.host, uri.port
    http.use_ssl = true
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)

    response.code.to_i == '204'
  end
end
