# Lambda function to notify a Slack channel when an SSM Session Manager session is created.
# This function is triggered by a CloudWatch Events rule monitoring the ssm:StartSession API call.
# To format friendly Slack-message output, it looks up:
# - EC2 instance name by tag
# - Location (city/state/country) by IP address
# - Slack username by email address (derived from the session ID, which is derived from the role session name)

require 'aws-sdk-ec2'
require 'geocoder'
require 'slack-ruby-client'

EC2 = Aws::EC2::Client.new

Geocoder.configure(
  cache: Hash.new,
  timeout: 10,
  ip_lookup: :freegeoip,
  freegeoip: {host: ENV['FREEGEOIP_HOST']}
)

require 'geocoder/lookups/freegeoip'
# Force Freegeoip to use HTTP protocol.
Geocoder::Lookup::Freegeoip.prepend(
  Module.new do
    def supported_protocols
      [:http]
    end
  end
)

def handler(event:, context:)
  puts "Incoming event: #{event}"
  detail = event['detail']
  slack = Slack::Web::Client.new(token: ENV['SLACK_API_TOKEN'])
  session_id = detail.dig('responseElements', 'sessionId')
  username = session_id

  log_link = "https://console.aws.amazon.com/cloudwatch/home#logEventViewer:group=#{ENV['AUDIT_LOG_PATH']};stream=#{session_id}"
  log_text = "<#{log_link}|:cloud: Log>"

  begin
    if (session_name = session_id&.match(/(.*)-.*$/)&.captures&.first)
      user_id = slack.users_lookupByEmail(email: session_name)&.user&.id
      username = user_id ? "<@#{user_id}>" : session_name
    end
  rescue => e
    puts e # Log Slack exceptions
  end

  instance_id = detail.dig('requestParameters', 'target')
  instance_link = "https://console.aws.amazon.com/ec2/v2/home#InstanceDetails:instanceId=#{instance_id}"
  instance_name = nil

  begin
    tags = EC2.describe_tags(
      filters: [{name: 'resource-id', values: [instance_id]}]
    ).tags.map {|x| [x.key, x.value]}.to_h
    instance_name = tags['Name']
    unless instance_name
      stack_name = tags['aws:cloudformation:stack-name']
      logical_id = tags['aws:cloudformation:logical-id']
      instance_name = "#{stack_name}:#{logical_id}" if stack_name && logical_id
    end
  rescue => e
    puts e # Log EC2 exceptions
  end

  ip = detail['sourceIPAddress']
  begin
    if (loc = Geocoder.search(ip).first)
      ip += " (#{loc.address})"
    end
  rescue => e
    puts e # Log geocoder exceptions
  end

  message = {
    channel: ENV['SLACK_CHANNEL'],
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "Session started for <#{instance_link}|`#{instance_name || instance_id}`> #{log_text}"
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: username
          },
          {
            'type': 'mrkdwn',
            'text': ip
          }
        ]
      }
    ]
  }
  puts "Message: #{message}"
  slack.chat_postMessage(message)
end
