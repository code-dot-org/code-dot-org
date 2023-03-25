require 'twilio-ruby'
class SmsController < ApplicationController
  protect_from_forgery except: [:send_to_phone] # the page that posts here is cached

  # set up a client to talk to the Twilio REST API
  def send_to_phone
    if params[:level_source].present? && params[:phone] && (level_source = LevelSource.find(params[:level_source]))
      send_sms_link(level_source_url(level_source), params[:phone])
    elsif params[:channel_id] && params[:phone] && ProjectsController::STANDALONE_PROJECTS.include?(params[:type])
      url =
        if params[:type] == 'weblab'
          "https://codeprojects.org/#{params[:channel_id]}"
        else
          polymorphic_url(["#{params[:type]}_project_share".to_sym, :projects], channel_id: params[:channel_id])
        end
      send_sms_link(url, params[:phone])
    else
      head :not_acceptable
    end
  end

  private def send_sms_link(link, phone)
    decorated_link = link + '?sms=true'
    body = "Check this out on Code Studio: #{decorated_link} (reply STOP to stop receiving this)"
    send_sms(body, phone)
  end

  private def send_sms(body, phone)
    # If the Twilio WebService is unavailable or experiencing latency issues we can no-op this method to avoid
    # tie-ing up all puma worker threads waiting for the Twilio API to respond by switching a Gatekeeper flag.
    return head :ok unless Gatekeeper.allows('twilio', default: true)

    http_client = Twilio::HTTP::Client.new(timeout: DCDO.get('webpurify_http_read_timeout', 10))
    @client = Twilio::REST::Client.new CDO.twilio_sid, CDO.twilio_auth, nil, nil, http_client
    @client.messages.create(
      messaging_service_sid: CDO.twilio_messaging_service,
      to: phone,
      body: body
    )
    head :ok
  rescue Twilio::REST::RestError => exception
    case exception.message
    when /The message From\/To pair violates a blacklist rule./
      # recipient unsubscribed from twilio, pretend it succeeded
      head :ok
    when /The \'To\' number .* is not a valid phone number\./
      head :bad_request
    else
      raise
    end
  end
end
