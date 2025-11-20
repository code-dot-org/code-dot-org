module AiLessonSummariesPodcastHelper
  API_KEY = CDO.elevenlabs_api_key
  MODEL = "eleven_v3"

  def self.get_podcast_from_script(script)
    client = Client.new(API_KEY, MODEL)
    response = client.request_podcast(script)

    #For debug until we have S3 setup
    if response.code == 200
      File.binwrite("podcast.mp3", response.body)
    end
  end

  class Client
    attr_accessor :api_key, :model

    VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
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
        body: data.to_json
      )
    end
  end
end
