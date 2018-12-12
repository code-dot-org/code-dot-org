require 'twilio-ruby'
class SmsController < ApplicationController
  protect_from_forgery except: [:send_to_phone] # the page that posts here is cached

  # set up a client to talk to the Twilio REST API
  def send_to_phone
    if params[:level_source] && !params[:level_source].empty? && params[:phone] && (level_source = LevelSource.find(params[:level_source]))
      send_sms(level_source_url(level_source), params[:phone])
    elsif params[:channel_id] && params[:phone] && ProjectsController::STANDALONE_PROJECTS.include?(params[:type])
      url =
        if params[:type] == 'weblab'
          "https://codeprojects.org/#{params[:channel_id]}"
        else
          polymorphic_url(["#{params[:type]}_project_share", 'projects'], channel_id: params[:channel_id])
        end
      send_sms(url, params[:phone])
    else
      head :not_acceptable
    end
  end

  private

  def send_sms(link, phone)
    # set up a client to talk to the Twilio REST API
    @client = Twilio::REST::Client.new CDO.twilio_sid, CDO.twilio_auth
    @client.messages.create(
      messaging_service_sid: CDO.twilio_messaging_service,
      to: phone,
      body: "Check this out on Code Studio: #{link} (reply STOP to stop receiving this)"
    )
    head :ok
  rescue Twilio::REST::RequestError => e
    if e.message == "The message From/To pair violates a blacklist rule."
      # recipient unsubscribed from twilio, pretend it succeeded
      head :ok
    elsif e.message =~ /The \'To\' number .* is not a valid phone number\./
      head :bad_request
    else
      raise
    end
  end
end
