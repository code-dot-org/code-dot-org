class OpenaiStudentPodcastTimeout < StandardError; end

module AiStudentPodcastsHelper
  ELEVENLABS_MODEL = "eleven_v3"
  OPENAI_MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
  PODCAST_BUCKET = CDO.dashboard_hostname.split('.').reverse.join('.') + '.user-content'
  PODCAST_FOLDER = 'student_podcasts/'
  VOICE_ID_DAN = "0sqkv877qKv8jUXFfsXj"
  VOICE_ID_SAM = "w7LY6CndrQObaTsPvYeB"

  def self.create_and_save_to_s3(student_podcast_data)
    filename = s3_filename(student_podcast_data.id)
    return if AWS::S3.exists_in_bucket(PODCAST_BUCKET, filename)
    return if student_podcast_data.podcast_script.blank?

    podcast = get_podcast_from_script(student_podcast_data.podcast_script)
    AWS::S3.upload_to_bucket(PODCAST_BUCKET, filename, podcast, no_random: true)
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
    prompt = AiSystemPrompts::StudentPodcastPromptHelper.get_openai_system_prompt(lesson_id, objective_ids, user_id)

    begin
      response = openai_client.request_podcast_script(prompt)
    rescue Net::ReadTimeout, Net::OpenTimeout
      raise OpenaiStudentPodcastTimeout.new("Timeout waiting for OpenAI client to return student podcast script")
    rescue StandardError => exception
      raise StandardError.new("Error generating AI student podcast script: #{exception.message}")
    end

    raise StandardError.new("Received status code #{response.code} when generating AI student podcast script: #{response.body}") unless response.code == 200

    content = JSON.parse(response.body).dig('choices', 0, 'message', 'content')
    JSON.parse(content).fetch('script').to_json
  end

  def self.get_podcast_from_script(podcast_script)
    begin
      response = elevenlabs_client.request_podcast(resolve_voice_ids(podcast_script))
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

  class ElevenlabsClient
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

  class OpenaiClient
    attr_accessor :api_key, :model

    OPENAI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_podcast_script(prompt)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{@api_key}"
      }

      data = {
        model: @model,
        messages: [{role: "system", content: prompt}],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "student_podcast_script",
            schema: {
              type: "object",
              properties: {
                script: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      voice_id: {type: "string", enum: %w[Dan Sam]},
                      text: {type: "string"}
                    },
                    required: %w[voice_id text],
                    additionalProperties: false
                  }
                }
              },
              required: ["script"],
              additionalProperties: false
            }
          }
        }
      }

      HTTParty.post(
        OPENAI_URL,
        headers: headers,
        body: data.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        read_timeout: DCDO.get('openai_http_read_timeout', 30)
      )
    end
  end

  def self.elevenlabs_client
    ElevenlabsClient.new(CDO.elevenlabs_api_key, ELEVENLABS_MODEL)
  end

  def self.openai_client
    OpenaiClient.new(CDO.openai_lesson_summaries_api_key, OPENAI_MODEL)
  end

  def self.s3_filename(student_podcast_id)
    PODCAST_FOLDER + 'student_podcast_' + student_podcast_id.to_s + '.mp3'
  end
end
