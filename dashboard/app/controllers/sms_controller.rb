require 'twilio-ruby'
class SmsController < ApplicationController
  protect_from_forgery except: [:send_to_phone, :send_download_url_to_phone] # the page that posts here is cached

  # set up a client to talk to the Twilio REST API
  def send_to_phone
    #if params[:song]
    if true
      #open_tik_tok_url = params[:song]
      open_tik_tok_url = 'https://www.tiktok.com/music/Level-Up-6580213968705424134?lang=en&is_copy_url=1'
      #video_url = "https://dance-api.code.org/videos/video-#{params[:channel_id]}.mp4"
      video_url = 'https://dance-api.code.org/videos/video-h4sxJYdlWGggroG0DRR9ug-demo3.mp4'
      message_body = "Here's your Dance Party video #{video_url} ! Save this video and open TikTok here to upload: #{open_tik_tok_url}"

      # We did this so that a message with
      # a link to download your video (the first send_sms call)
      # would get sent to your phone
      # even if the video send failed (the second send_sms call)
      send_sms(message_body, params[:phone])
      send_sms("Here's your video", params[:phone], video_url)
    elsif params[:level_source] && !params[:level_source].empty? && params[:phone] && (level_source = LevelSource.find(params[:level_source]))
      send_sms_link(level_source_url(level_source), params[:phone])
    elsif params[:channel_id] && params[:phone] && ProjectsController::STANDALONE_PROJECTS.include?(params[:type])
      url =
        if params[:type] == 'weblab'
          "https://codeprojects.org/#{params[:channel_id]}"
        else
          polymorphic_url(["#{params[:type]}_project_share", 'projects'], channel_id: params[:channel_id])
        end
      send_sms_link(url, params[:phone])
    else
      head :not_acceptable
    end
  end

  def send_download_url_to_phone
    body = "Install this app created in Code Studio on your Android device: #{params[:url]} (reply STOP to stop receiving this)"
    send_sms(body, params[:phone])
  end

  private

  def send_sms_link(link, phone)
    body = "Check this out on Code Studio: #{link} (reply STOP to stop receiving this)"
    send_sms(body, phone)
  end

  def send_sms(body, phone, media_url=nil)
    # If the Twilio WebService is unavailable or experiencing latency issues we can no-op this method to avoid
    # tie-ing up all puma worker threads waiting for the Twilio API to respond by switching a Gatekeeper flag.
    return head :ok unless Gatekeeper.allows('twilio', default: true)

    http_client = Twilio::HTTP::Client.new(timeout: DCDO.get('webpurify_http_read_timeout', 10))
    @client = Twilio::REST::Client.new CDO.twilio_sid, CDO.twilio_auth, nil, nil, http_client

    text_message_parameters = {
      messaging_service_sid: CDO.twilio_messaging_service,
      to: phone,
      body: body
    }
    text_message_parameters[:media_url] = media_url if media_url

    @client.messages.create(
      text_message_parameters
    )

    head :ok
  rescue Twilio::REST::RestError => e
    if e.message =~ /The message From\/To pair violates a blacklist rule./
      # recipient unsubscribed from twilio, pretend it succeeded
      head :ok
    elsif e.message =~ /The \'To\' number .* is not a valid phone number\./
      head :bad_request
    else
      raise
    end
  end
end
