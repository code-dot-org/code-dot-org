require 'net/http'
require 'uri'

class Slack

  COLOR_MAP = {
    green: 'good',
    yellow: 'warning',
    red: 'danger',
    purple: '#7665a0'
  }

  CHANNEL_MAP = {
    'developers' => 'general',
    'server operations' => 'server-operations',
    'staging' => 'infra-staging',
    'test' => 'infra-test',
    'production' => 'infra-production'
  }

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
      response = Net::HTTP.post_form(url, {
        payload: payload.to_json
      })

      response.code.to_s == '200'
    rescue
      return false
    end
  end

end
