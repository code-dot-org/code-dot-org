module AiLessonSummaryPodcastsHelper
  MODEL = "eleven_v3"
  PODCAST_BUCKET = 'org.code.autoscale-prod-studio.user-content'
  PODCAST_FOLDER = 'podcasts/'

  def self.create_and_save_to_s3(lesson_id, user_id)
    script = AiLessonSummariesHelper.retrieve_and_save_ai_lesson_summary(lesson_id, user_id, true)[:script]
    filename = PODCAST_FOLDER+'lesson_'+lesson_id.to_s+'_podcast.mp3'

    unless AWS::S3.exists_in_bucket(PODCAST_BUCKET, filename)
      podcast = get_podcast_from_script(script)
      AWS::S3.upload_to_bucket(PODCAST_BUCKET, filename, podcast, no_random: true)
    end
  end

  def self.retrieve_podcast_from_s3(lesson_id)
    filename = PODCAST_FOLDER+'lesson_'+lesson_id.to_s+'_podcast.mp3'
    AWS::S3.download_from_bucket(PODCAST_BUCKET, filename)
  end

  def self.get_podcast_from_script(script)
    begin
      response = client.request_podcast(script)
    rescue Net::OpenTimeout, Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return lesson summary podcast")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI lesson summary podcast: #{exception.message}")
    end

    if response.code == 200
      return response.body
    else
      raise StandardError.new("Error processing AI lesson summary podcast: status code #{response.code}: #{response.body}")
    end
  end

  class Client
    attr_accessor :api_key, :model

    VOICE_ID = "Fc5CaIGWKvLHapoOSM2K"
    ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech/#{VOICE_ID}?output_format=mp3_44100_128"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_podcast(prompt)
      headers = {
        "Content-Type" => "application/json",
        "xi-api-key" => @api_key
      }

      data = {
        model_id: @model,
        text: prompt
      }

      HTTParty.post(
        ELEVENLABS_URL,
        headers: headers,
        body: data.to_json,
        timeout: 180,
      )
    end
  end

  def self.client
    Client.new(CDO.elevenlabs_api_key, MODEL)
  end
end
