require 'net/http'
require 'uri'

class Slack
  COLOR_MAP = {
    green: 'good',
    yellow: 'warning',
    red: 'danger',
    purple: '#7665a0'
  }.freeze

  CHANNEL_MAP = {
    'developers' => 'general',
    'server operations' => 'server-operations',
    'staging' => 'infra-staging',
    'test' => 'infra-test',
    'production' => 'infra-production'
  }.freeze

  SLACK_TOKEN = CDO.slack_token.freeze

  # @param channel_name [String] The channel to fetch the topic.
  # @return [String | nil] The existing topic, nil if not found.
  def self.get_topic(channel_name, use_channel_map = false)
    if use_channel_map && (CHANNEL_MAP.include? channel_name.to_sym)
      channel_name = CHANNEL_MAP[channel_name]
    end

    channel_id = get_channel_id(channel_name)
    return nil unless channel_id

    response = open(
      'https://slack.com/api/channels.info'\
      "?token=#{SLACK_TOKEN}"\
      "&channel=#{channel_id}"\
    )

    begin
      parsed_response = JSON.parse(response.string)
    rescue JSON::ParserError
      return nil
    end

    unless parsed_response['ok']
      return nil
    end

    parsed_response['channel']['latest']['topic']
  end

  # @param channel_name [String] The channel to update the topic.
  # @param new_topic [String] The topic to post.
  # @param use_channel_map [Boolean] Whether to look up channel_name in
  #   CHANNEL_MAP.
  # @return [Boolean] Whether the topic was successfully updated.
  def self.update_topic(channel_name, new_topic, use_channel_map = false)
    if use_channel_map && (CHANNEL_MAP.include? channel_name.to_sym)
      channel_name = CHANNEL_MAP[channel_name]
    end

    channel_id = get_channel_id(channel_name)
    return false unless channel_id

    response = open('https://slack.com/api/channels.setTopic'\
      "?token=#{SLACK_TOKEN}"\
      "&channel=#{channel_id}"\
      "&topic=#{new_topic}"
    )

    JSON.parse(response.string)['ok']
  end

  # @param text [String] The text to post in Slack.
  # @return [Boolean] Whether the text was posted to Slack successfully.
  def self.message(text, params={})
    return false unless CDO.slack_endpoint

    if params[:color]
      payload = {
        attachments: [{
          fallback: text,
          text: text,
          mrkdwn_in: [:text],
          color: COLOR_MAP[params[:color].to_sym] || params[:color]
        }]
      }.merge params
    else
      payload = {
        text: text,
        unfurl_links: true
      }.merge params
    end

    url = URI.parse("https://hooks.slack.com/services/#{CDO.slack_endpoint}")
    begin
      response = Net::HTTP.post_form(
        url,
        {payload: payload.to_json}
      )

      response.code.to_s == '200'
    rescue
      return false
    end
  end

  private

  # Returns the channel ID for the channel with the requested channel_name.
  # @param channel_name [String] The name of the Slack channel.
  # @return [nil | String] The Slack channel ID for the channel, nil if not
  #   found.
  def get_channel_id(channel_name)
    # Documentation at https://api.slack.com/methods/channels.list.
    slack_api_url = "https://slack.com/api/channels.list?token=#{SLACK_TOKEN}"
    channels = open(slack_api_url).read
    begin
      parsed_channels = JSON.parse(channels)
    rescue JSON::ParserError
      return nil
    end
    return nil unless parsed_channels['channels']
    parsed_channels['channels'].each do |parsed_channel|
      return parsed_channel['id'] if parsed_channel['name'] == channel_name
    end
    nil
  end
end
