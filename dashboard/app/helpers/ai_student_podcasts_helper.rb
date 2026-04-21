module AiStudentPodcastsHelper
  MODEL = "eleven_v3"
  PODCAST_BUCKET = CDO.dashboard_hostname.split('.').reverse.join('.') + '.user-content'
  PODCAST_FOLDER = 'student_podcasts/'

  def self.create_and_save_to_s3(fragment)
    filename = s3_filename(fragment.id)

    unless AWS::S3.exists_in_bucket(PODCAST_BUCKET, filename)
      podcast = get_podcast_from_script(fragment.podcast_script)
      AWS::S3.upload_to_bucket(PODCAST_BUCKET, filename, podcast, no_random: true)
    end
  end

  def self.retrieve_podcast_from_s3(fragment_id)
    AWS::S3.download_from_bucket(PODCAST_BUCKET, s3_filename(fragment_id))
  end

  def self.get_podcast_from_script(script)
    begin
      response = client.request_podcast(script)
    rescue Net::OpenTimeout, Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return student podcast")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI student podcast: #{exception.message}")
    end

    if response.code == 200
      return response.body
    else
      raise StandardError.new("Error processing AI student podcast: status code #{response.code}: #{response.body}")
    end
  end

  class Client
    attr_accessor :api_key, :model

    VOICE_ID_ADAM = "s3TPKV1kjDlVtZbl4Ksh"
    VOICE_ID_HOPE = "tnSpp4vdxKPjI9w0GnoV"
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

  def self.s3_filename(fragment_id)
    PODCAST_FOLDER + 'fragment_' + fragment_id.to_s + '.mp3'
  end
end
