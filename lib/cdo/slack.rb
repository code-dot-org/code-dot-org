require 'net/http'
require 'open-uri'
require 'retryable'

class Slack
  COLOR_MAP = {
    green: 'good',
    yellow: 'warning',
    red: 'danger',
    purple: '#7665a0'
  }.freeze

  CHANNEL_MAP = {
    'server operations' => 'server-operations',
    'staging' => 'infra-staging',
    'test' => 'infra-test',
    'production' => 'infra-production'
  }.freeze

  SLACK_TOKEN = CDO.slack_token.freeze

  # Returns the user (mention) name of the user.
  # WARNING: Does not include the mention character '@'.
  # @param email [String] The email of the Slack user.
  # @raise [ArgumentError] If the email does not correspond to a Slack user.
  # @return [nil | String] The user (mention) name for the Slack user.
  def self.user_name(email)
    users_list = open("https://slack.com/api/users.list?token=#{SLACK_TOKEN}").
      read
    members = JSON.parse(users_list)['members']
    user = members.find {|member| email == member['profile']['email']}
    raise "Slack email #{email} not found" unless user
    user['name']
  end

  # @param channel_name [String] The channel to fetch the topic.
  # @return [String | nil] The existing topic, nil if not found.
  def self.get_topic(channel_name, use_channel_map = false)
    if use_channel_map && (CHANNEL_MAP.include? channel_name.to_sym)
      channel_name = CHANNEL_MAP[channel_name]
    end

    channel_id = get_channel_id(channel_name)
    return nil unless channel_id

    response = Retryable.retryable(on: [Errno::ETIMEDOUT, OpenURI::HTTPError], tries: 2) do
      open(
        'https://slack.com/api/conversations.info'\
        "?token=#{SLACK_TOKEN}"\
        "&channel=#{channel_id}"\
      )
    end

    begin
      parsed_response = JSON.parse(response.read)
    rescue JSON::ParserError
      return nil
    end

    unless parsed_response['ok']
      return nil
    end

    replace_user_links(parsed_response['channel']['topic']['value'])
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

    response = open('https://slack.com/api/conversations.setTopic'\
      "?token=#{SLACK_TOKEN}"\
      "&channel=#{channel_id}"\
      "&topic=#{new_topic}"
    )
    result = JSON.parse(response.read)
    raise "Failed to update_topic, with error: #{result['error']}" if result['error']
    result['ok']
  end

  def self.replace_user_links(message)
    message.gsub(/<@(.*?)>/) {'@' + get_display_name($1)}
  end

  def self.get_display_name(user_id)
    response = open(
      'https://slack.com/api/users.info'\
      "?token=#{SLACK_TOKEN}"\
      "&user=#{user_id}"\
    ).read
    return user_id unless response
    parsed_response = JSON.parse(response)
    return user_id unless parsed_response['ok']
    parsed_response['user']['profile']['display_name']
  end

  # For more information about the Slack API, see
  # https://api.slack.com/incoming-webhooks#sending_messages.
  # @param text [String] The text to post in Slack.
  # @param params [Hash] A hash of parameters to alter how the text is posted.
  #   channel (required): The channel to post the text to. Note that the
  #     CHANNEL_MAP is used to map the channel, if applicable.
  #   username (unknown): The username of the user making the post.
  #   color (optional): The color the post should be.
  # @return [Boolean] Whether the text was posted to Slack successfully.
  # WARNING: This function mutates params.
  def self.message(text, params={})
    return false unless CDO.slack_endpoint
    params[:channel] = "\##{Slack::CHANNEL_MAP[params[:channel]] || params[:channel]}"
    slackified_text = slackify text

    payload =
      if params[:color]
        {
          attachments: [{
            fallback: slackified_text,
            text: slackified_text,
            mrkdwn_in: [:text],
            color: COLOR_MAP[params[:color].to_sym] || params[:color]
          }]
        }.merge params
      else
        {
          text: slackified_text,
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

  # For more information see
  # https://github.com/ErikKalkoken/slackApiDoc/blob/master/chat.command.md. NOTE This API is 'undocumented' and not part of the official Slack APIs.
  # @param channel_name [String] Name of the Slack channel to post the command to.
  # @param command [String] Command to execute, excluding the /.
  # @param message [String] Optional text passed to the command.
  # @return [Boolean] Whether the command was posted to Slack successfully.
  def self.command(channel_name, command, message="")
    channel_id = get_channel_id(channel_name)
    response = open(
      "https://slack.com/api/chat.command?channel=#{channel_id}"\
      "&command=/#{command}"\
      "&text=#{message}"\
      "&token=#{SLACK_TOKEN}"
    )

    result = JSON.parse(response.read)
    raise "Failed to post command with: #{result['error']}" if result['error']
    result['ok']
  end

  def self.snippet(room, text)
    # omit leading '#' when passing channel names to this API
    channel = CHANNEL_MAP[room] || room
    open('https://slack.com/api/files.upload'\
      "?token=#{SLACK_TOKEN}"\
      "&content=#{URI.escape(text)}"\
      "&channels=#{channel}"
    )
  end

  def self.join_room(name)
    response = open(
      'https://slack.com/api/conversations.join'\
      "?token=#{SLACK_TOKEN}"\
      "&channel=#{get_channel_id(name)}"
    )

    result = JSON.parse(response.read)
    raise "Failed to join_room, with error: #{result['error']}" if result['error']
    result['ok']
  end

  # Returns the channel ID for the channel with the requested channel_name.
  # @param channel_name [String] The name of the Slack channel.
  # @return [nil | String] The Slack channel ID for the channel, nil if not
  #   found.
  private_class_method def self.get_channel_id(channel_name)
    raise "CDO.slack_token undefined" if SLACK_TOKEN.nil?
    # Documentation at https://api.slack.com/methods/channels.list.
    slack_api_url = "https://slack.com/api/conversations.list"\
      "?token=#{SLACK_TOKEN}&limit=1000&types=public_channel&exclude_archived=true"
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

  # Format with slack markdownish formatting instead of HTML.
  # https://slack.zendesk.com/hc/en-us/articles/202288908-Formatting-your-messages
  private_class_method def self.slackify(message)
    message_copy = message.dup
    message_copy.strip!
    message_copy = "```#{message_copy[7..-1]}```" if message_copy =~ /^\/quote /
    message_copy.
      gsub(/<\/?i>/, '_').
      gsub(/<\/?b>/, '*').
      gsub(/<\/?pre>/, '```').
      gsub(/<a href=['"]([^'"]+)['"]>/, '<\1|').
      gsub(/<\/a>/, '>').
      gsub(/<br\/?>/, "\n")
  end
end
