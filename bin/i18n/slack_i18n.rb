require 'cdo/slack'

class SlackI18n
  I18N_CHANNEL = "C99KAHFK9"
  TEST_CHANNEL = "C02CHFE9J91"

  EMOJI_MAP = {
    "success" => ":large_green_circle:",
    "fail" => ":red_circle:"
  }.freeze

  # Send an i18n sync logging message to Slack
  # @param message [String] Message text to be logged
  # @param options (optional) [Hash] Any additional Slack API params
  def self.message(message, options={})
    if options["emoji_prefix"]
      message = "#{EMOJI_MAP[options['emoji_prefix']]} #{message}"
      options.except!(["emoji_prefix"])
    end

    args = {
      "icon_emoji" => ":world_map:",
      "username" => "i18n-dev",
      "channel" => TEST_CHANNEL,
      "text" => message
    }.merge(options)

    Slack.message2(args)
  end

  # Post the sync log file to slack after the sync script exits
  # @param filename [String] Filename of the log file
  def self.post_log(filename)
    Slack.upload_file(TEST_CHANNEL, Rails.root.join("..", "log", filename).to_s,
      {
        "filename" => "Sync In #{Time.now}",
        "icon_emoji" => ":world_map:",
        "username" => "i18n-dev"
      }
    )
  end
end
