require 'cdo/chat_client'
require 'net/http'

module GitHub
  PULL_API_BASE = 'https://api.github.com/repos/code-dot-org/code-dot-org/pulls'.freeze

  # Returns whether "DTT: yes" is a substring of the topic in the #developers
  # room.
  def self.dtt_yes?
    current_topic = Slack.get_topic('developers')
    current_topic.include? 'DTT: yes'
  end

  # Updates the #developers topic to reflect robo-DTT in progress.
  # "DTT: no (robo-DTT in progress)".
  def self.update_dtt
  end

  # GitHub API: https://developer.github.com/v3/pulls/#create-a-pull-request
  # @return [nil | Integer] Returns the PR number of the newly created DTT if
  #   successful, or nil if unsuccessful.
  def self.create_dtt_pull_request
    params = {
      title: 'DTT (Staging > Test) [robo-dtt]',
      head: 'staging',
      base: 'test'
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
  def self.merge_dtt_pull_request(pr_number)
    return if is_merged?(pr_number)

    uri = URI.parse "{PULL_API_BASE}/{#pr_number}/merge"
    http = Net::HTTP.new uri.host, uri.port
    http.use_ssl = true
    request = Net::HTTP::Put.new(uri.request_uri)
    request['Authorization'] = "token #{CDO.github_access_token}"
    response = http.request(request)

    return response.code == '200'
  end

  # @param pr_number [Integer] The number of the pull request to check.
  # @return [Boolean] Whether the pull request has been merged.
  def self.merged?(pr_number)
    uri = URI.parse "#{PULL_API_BASE}/#{pr_number}/merge"
    http = Net::HTTP.new uri.host, uri.port
    http.use_ssl = true
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)

    response.code.to_i == 204
  end
end
