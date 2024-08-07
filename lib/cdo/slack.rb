require 'uri'
require 'net/http'
require 'retryable'
require 'json'
require 'cdo/honeybadger'

class Slack
  COLOR_MAP = {
    green: 'good',
    yellow: 'warning',
    red: 'danger',
    purple: '#8c52ba'
  }.freeze

  CHANNEL_MAP = {
    'content-editors' => 'content-editors',
    'server operations' => 'server-operations',
    'staging' => 'infra-staging',
    'test' => 'infra-test',
    'production' => 'infra-production'
  }.freeze

  # Common channel name to ID mappings
  CHANNEL_IDS = {
    'content-editors' => 'C03A2LG1JLQ',
    'developers' => 'C0T0PNTM3',
    'deploy-status' => 'C7GS8NE8L',
    'infra-staging' => 'C03CK8E51',
    'infra-test' => 'C03CM903Y',
    'infra-production' => 'C03CK8FGX',
    'infra-honeybadger' => 'C55JZ1BPZ',
    'levelbuilder' => 'C0T10H2HY',
    'server-operations' => 'C0CCSS3PX'
  }.freeze

  # TODO DELETE THIS COMMENT
  SLACK_TOKEN = CDO.methods.include?(:slack_token) ? CDO.slack_token.freeze : nil
  SLACK_BOT_TOKEN = CDO.methods.include?(:slack_bot_token) ? CDO.slack_bot_token.freeze : nil

  # Returns the user (mention) name of the user.
  # WARNING: Does not include the mention character '@'.
  # @param email [String] The email of the Slack user.
  # @raise [ArgumentError] If the email does not correspond to a Slack user.
  # @return [nil | String] The user (mention) name for the Slack user.
  def self.user_name(email)
    members = post_to_slack("https://slack.com/api/users.list")['members']
    raise "Failed to query users.list" unless members
    user = members.find {|member| email == member['profile']['email']}
    raise "Slack email #{email} not found" unless user
    user['name']
  end

  def self.user_id(name)
    members = post_to_slack("https://slack.com/api/users.list")['members']
    raise "Failed to query users.list" unless members
    user = members.find {|member| name == member['name']}
    raise "Slack user #{name} not found" unless user
    user['id']
  end

  # @param channel_name [String] The channel to fetch the topic.
  # @return [String | nil] The existing topic, nil if not found.
  def self.get_topic(channel_name, use_channel_map: false)
    if use_channel_map && (CHANNEL_MAP.include? channel_name.to_sym)
      channel_name = CHANNEL_MAP[channel_name]
    end

    channel_id = get_channel_id(channel_name)
    return nil unless channel_id

    response = post_to_slack("https://slack.com/api/conversations.info?channel=#{channel_id}")
    return nil unless response
    replace_user_links(response['channel']['topic']['value'])
  end

  # @param channel_name [String] The channel to update the topic.
  # @param new_topic [String] The topic to post.
  # @param use_channel_map [Boolean] Whether to look up channel_name in
  #   CHANNEL_MAP.
  # @return [Boolean] Whether the topic was successfully updated.
  def self.update_topic(channel_name, new_topic, use_channel_map: false)
    if use_channel_map && (CHANNEL_MAP.include? channel_name.to_sym)
      channel_name = CHANNEL_MAP[channel_name]
    end

    channel_id = get_channel_id(channel_name)
    return false unless channel_id

    url = "https://slack.com/api/conversations.setTopic"
    payload = {"channel" => channel_id, "topic" => new_topic}
    result = post_to_slack(url, payload)
    return !!result
  end

  def self.replace_user_links(message)
    message.gsub(/<@(.*?)>/) {'@' + get_display_name($1)}
  end

  # @param user_id [String] The user whose name you are looking for.
  # @return [String] Slack 'display_name' if one is set, otherwise Slack 'name'.
  #   Returns provided user_id if not found.
  def self.get_display_name(user_id)
    response = post_to_slack("https://slack.com/api/users.info?user=#{user_id}")

    return user_id unless response
    profile = response['user']['profile']
    return profile['display_name'] unless profile['display_name'] == ""
    response['user']['name']
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
  # NOTE: This function utilizes an incoming webhook, not the Slack token
  def self.message(text, params = {})
    return false unless CDO.slack_endpoint
    params[:channel] = "##{Slack::CHANNEL_MAP[params[:channel]] || params[:channel]}"
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

  # Bot tokens are unable to post to reminders.add or chat.command, so we will mimic the functionality of a slack reminder
  #  by scheduling a DM to the user at a specific time.
  # @param recipient_id [String] Slack ID of user to message.
  # @param time [String] Unix timestamp of the time the message should be sent.
  # @param message [String] Text to be sent in the scheduled message.
  def self.remind(recipient_id, time, message)
    result = post_to_slack("https://slack.com/api/chat.scheduleMessage", {"channel" => recipient_id, "post_at" => time, "text" => message})
    return !!result
  end

  # @param room [String] Channel name or id to post the snippet.
  # @param text [String] Snippet text.
  def self.snippet(room, text)
    # omit leading '#' when passing channel names to this API
    channel = CHANNEL_MAP[room] || room
    result = post_to_slack("https://slack.com/api/files.upload?channels=#{channel}&content=#{URI.encode_www_form_component(text)}")
    return !!result
  end

  # @param name [String] Name of the Slack channel to join.
  def self.join_room(name)
    channel = get_channel_id(name)
    return false unless channel
    result = post_to_slack("https://slack.com/api/conversations.join", {"channel" => channel})
    return !!result
  end

  # Returns the channel ID for the channel with the requested channel_name.
  # @param channel_name [String] The name of the Slack channel.
  # @return [nil | String] The Slack channel ID for the channel, nil if not
  #   found.
  private_class_method def self.get_channel_id(channel_name)
    return CHANNEL_IDS[channel_name] if CHANNEL_IDS[channel_name]

    raise "CDO.slack_token undefined" if SLACK_TOKEN.nil?
    # Documentation at https://api.slack.com/methods/channels.list.
    url = "https://slack.com/api/conversations.list?limit=1000&types=public_channel&exclude_archived=true"
    parsed_channels = post_to_slack(url)
    return nil unless parsed_channels && parsed_channels['channels']

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
    message_copy = "```#{message_copy[7..]}```" if /^\/quote /.match?(message_copy)
    message_copy.
      gsub(/<\/?i>/, '_').
      gsub(/<\/?b>/, '*').
      gsub(/<\/?pre>/, '```').
      gsub(/<a href=['"]([^'"]+)['"]>/, '<\1|').
      gsub(/<\/a>/, '>').
      gsub(/<br\/?>/, "\n")
  end

  private_class_method def self.post_to_slack(url, payload = nil)
    if SLACK_BOT_TOKEN && SLACK_BOT_TOKEN != ''
      token = SLACK_BOT_TOKEN
    else
      # TODO: Remove after deprecating legacy SLACK_TOKEN
      opts = {
        error_class: "Slack integration [warn]",
        error_message: "Using legacy token",
        context: {url: url, payload: payload}
      }
      Honeybadger.notify_cronjob_error opts

      token = SLACK_TOKEN
    end

    headers = {
      "Content-type" => "application/json; charset=utf-8",
      "Authorization" => "Bearer #{token}"
    }

    uri = URI(url)
    https = Net::HTTP.new(uri.host, uri.port)
    https.use_ssl = true
    req = Net::HTTP::Post.new(url, headers)
    req.body = payload.to_json if payload

    begin
      res = https.request(req)
      parsed_res = JSON.parse(res.body)
      response = parsed_res

      unless response['ok']
        opts = {
          error_class: "Slack integration [error]",
          error_message: parsed_res['error'],
          context: {url: url, payload: payload, response: parsed_res}
        }
        Honeybadger.notify_cronjob_error opts
        response = false
      end
    rescue Exception => exception
      opts = {
        error_class: "Slack integration [error]",
        error_message: exception,
        context: {url: url, payload: payload}
      }
      Honeybadger.notify_cronjob_error opts
      response = false
    end
    response
  end
end
