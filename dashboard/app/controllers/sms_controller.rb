require 'twilio-ruby'
class SmsController < ApplicationController

# put your own credentials here
ACCOUNT_SID = CDO.twilio_sid
AUTH_TOKEN = CDO.twilio_auth
SMS_FROM = CDO.twilio_phone

# set up a client to talk to the Twilio REST API

  def send_to_phone
    if params[:level_source] && params[:phone] && (level_source = LevelSource.find(params[:level_source]))
      send_sms(level_source, params[:phone])
      render status: :ok, nothing: true
    else
      render status: :not_acceptable, nothing: true
    end
  end

  private

  def send_sms(level_source, phone)
    # set up a client to talk to the Twilio REST API
    @client = Twilio::REST::Client.new ACCOUNT_SID, AUTH_TOKEN
    @client.messages.create(
      :from => SMS_FROM,
      :to => phone,
      :body => "Check this out on Code Studio: #{level_source_url(level_source)}. (reply STOP to stop receiving this)"
    )
  end
end
