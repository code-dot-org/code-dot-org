module AiLessonSummaryPodcastsHelper
  API_KEY = CDO.elevenlabs_api_key
  MODEL = "eleven_v3"

  def self.get_podcast_from_script(script)
    client = Client.new(API_KEY, MODEL)
    begin
      response = client.request_podcast(script)
    rescue Net::ReadTimeout
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

  def self.generate_sample_podcasts(lessons, user)
    count = 1
    lessons.each do |lesson|
      script = AiLessonSummariesHelper.generate_lesson_summary(lesson, user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])[:json]
      script = JSON.parse(script)['podcast_script']
      podcast = AiLessonSummaryPodcastsHelper.get_podcast_from_script(script)

      File.binwrite('lesson'+count.to_s+'.mp3', podcast)
      count += 1
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
        timeout: 240
      )
    end
  end
end
