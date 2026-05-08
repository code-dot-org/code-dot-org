module AiStudentPodcastsHelper
  MODEL = "eleven_v3"
  PODCAST_BUCKET = CDO.dashboard_hostname.split('.').reverse.join('.') + '.user-content'
  PODCAST_FOLDER = 'student_podcasts/'
  VOICE_ID_DAN = "0sqkv877qKv8jUXFfsXj"
  VOICE_ID_SAM = "w7LY6CndrQObaTsPvYeB"

  def self.create_and_save_to_s3(student_podcast_data)
    filename = s3_filename(student_podcast_data.id)

    unless AWS::S3.exists_in_bucket(PODCAST_BUCKET, filename)
      podcast = get_podcast_from_script(student_podcast_data.podcast_script)
      AWS::S3.upload_to_bucket(PODCAST_BUCKET, filename, podcast, no_random: true)
    end
  end

  def self.retrieve_podcast_from_s3(student_podcast_id)
    AWS::S3.download_from_bucket(PODCAST_BUCKET, s3_filename(student_podcast_id))
  end

  VOICE_ID_MAP = {
    'Dan' => VOICE_ID_DAN,
    'Sam' => VOICE_ID_SAM
  }.freeze

  def self.resolve_voice_ids(podcast_script)
    parsed = JSON.parse(podcast_script)
    parsed.map do |entry|
      entry.merge('voice_id' => VOICE_ID_MAP.fetch(entry['voice_id'], entry['voice_id']))
    end
  end

  def self.generate_podcast_script(lesson_id, objective_ids, user_id = nil)
  end

  def self.get_podcast_from_script(podcast_script)
    begin
      response = client.request_podcast(resolve_voice_ids(podcast_script))
    rescue Net::OpenTimeout, Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return student podcast")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI student podcast: #{exception.message}")
    end

    if response.code == 200
      File.binwrite(Rails.root.join('..', 'test_podcast.mp3'), response.body)
      return response.body
    else
      raise StandardError.new("Error processing AI student podcast: status code #{response.code}: #{response.body}")
    end
  end

  class Client
    attr_accessor :api_key, :model

    ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-dialogue"

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
        inputs: prompt
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

  def self.s3_filename(student_podcast_id)
    PODCAST_FOLDER + 'student_podcast_' + student_podcast_id.to_s + '.mp3'
  end
end
