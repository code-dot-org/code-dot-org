require 'net/http'
require 'uri'

class Slack

  def self.message(text, params={})
    return false unless CDO.slack_endpoint

    payload = {
      text:text,
    }.merge(
      params
    )

    url = URI.parse("https://hooks.slack.com/services/#{CDO.slack_endpoint}")
    begin
      response = Net::HTTP.post_form(url, {
        payload:payload.to_json
      })

      response.code.to_s == '200'
    rescue
      return false
    end
  end

end
