class OpenaiStudentPodcastTimeout < StandardError; end
class StudentPodcastToxicityRetriesExceeded < StandardError; end

module AiStudentPodcastsHelper
  ELEVENLABS_MODEL = "eleven_v3"
  OPENAI_MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
  PODCAST_FOLDER = 'student_podcasts/'
  VOICE_ID_DAN = "0sqkv877qKv8jUXFfsXj"
  VOICE_ID_SAM = "w7LY6CndrQObaTsPvYeB"
  # Caps the regenerate-until-clean loop so a stuck prompt or model can't run
  # OpenAI calls (and the bill) without bound.
  MAX_TOXICITY_RETRIES = 5

  def self.create_and_save_to_s3(student_podcast_data)
    bucket = Cdo::AwsWrapper::S3.user_content_bucket
    filename = s3_filename(student_podcast_data.lesson_id, student_podcast_data.objective_ids)

    if Cdo::AwsWrapper::S3.exists_in_bucket(bucket, filename)
      # S3 already has the audio for this (lesson, objectives) key, generated
      # for some other user. Mirror that user's script onto this record so its
      # podcast_script field doesn't lag the playable audio.
      copy_matching_script_from_peer(student_podcast_data) if student_podcast_data.podcast_script.nil?
      return
    end

    return unless elevenlabs_client.available_credits

    podcast_script = student_podcast_data.podcast_script || generate_podcast_script(student_podcast_data)
    podcast = get_podcast_from_script(podcast_script)
    Cdo::AwsWrapper::S3.upload_to_bucket(bucket, filename, podcast, no_random: true)
  end

  def self.copy_matching_script_from_peer(student_podcast_data)
    peer = find_matching_script_record(student_podcast_data)
    student_podcast_data.update!(podcast_script: peer.podcast_script) if peer
  end

  # Returns another AiStudentPodcast covering the same lesson + objective set
  # whose podcast_script has already been generated, or nil if none exists.
  # Used for both proactive deduplication (skip OpenAI when a peer has the
  # script) and backfill (sync this record's script after the S3 file is
  # already up).
  def self.find_matching_script_record(student_podcast_data)
    objective_ids = student_podcast_data.objective_ids
    if objective_ids.empty?
      # An objectiveless podcast has no join rows, so the INNER JOIN
      # aggregation below can never match it; look it up by their absence.
      AiStudentPodcast.
        where(lesson_id: student_podcast_data.lesson_id).
        where.not(podcast_script: nil).
        where.missing(:ai_student_podcast_objectives).
        first
    else
      AiStudentPodcast.
        joins(:ai_student_podcast_objectives).
        where(lesson_id: student_podcast_data.lesson_id).
        where.not(podcast_script: nil).
        group('ai_student_podcasts.id').
        having(
          'COUNT(ai_student_podcast_objectives.objective_id) = ? AND SUM(ai_student_podcast_objectives.objective_id IN (?)) = ?',
          objective_ids.size,
          objective_ids,
          objective_ids.size
        ).
        first
    end
  end

  def self.retrieve_podcast_from_s3(lesson_id, objective_ids)
    Cdo::AwsWrapper::S3.download_from_bucket(Cdo::AwsWrapper::S3.user_content_bucket, s3_filename(lesson_id, objective_ids))
  end

  def self.exists_in_s3?(lesson_id, objective_ids)
    Cdo::AwsWrapper::S3.exists_in_bucket(Cdo::AwsWrapper::S3.user_content_bucket, s3_filename(lesson_id, objective_ids))
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

  def self.generate_podcast_script(student_podcast_data)
    existing_script_podcast = find_matching_script_record(student_podcast_data)

    if existing_script_podcast
      student_podcast_data.update!(podcast_script: existing_script_podcast.podcast_script)
      return existing_script_podcast.podcast_script
    end

    prompt = AiSystemPrompts::StudentPodcastPromptHelper.get_openai_system_prompt(student_podcast_data.lesson_id, student_podcast_data.objective_ids, student_podcast_data.user_id)

    MAX_TOXICITY_RETRIES.times do
      podcast_script = request_openai_podcast_script(prompt)
      next if script_toxic?(podcast_script)

      student_podcast_data.podcast_script = podcast_script
      student_podcast_data.save!
      return podcast_script
    end

    raise StudentPodcastToxicityRetriesExceeded.new("AI student podcast script failed toxicity filter after #{MAX_TOXICITY_RETRIES} attempts")
  end

  def self.request_openai_podcast_script(prompt)
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

  # Concatenates the spoken dialog and routes it through the podcast-specific
  # toxicity detector. The role tag is 'Model' because the text under review
  # is AI-generated output, not user input.
  def self.script_toxic?(podcast_script)
    dialog_text = JSON.parse(podcast_script).map {|entry| entry['text']}.join("\n")
    !AiPodcastsSafetyHelper.find_toxicity(dialog_text, 'Model').nil?
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
    ELEVENLABS_SUBSCRIPTION_URL = "https://api.elevenlabs.io/v1/user/subscription"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def available_credits
      headers = {
        "Content-Type" => "application/json",
        "xi-api-key" => @api_key
      }

      user_response = HTTParty.get(
        ELEVENLABS_SUBSCRIPTION_URL,
        headers: headers,
        timeout: 180,
      )

      subscription_info = JSON.parse(user_response.body)

      subscription_info['character_count'] < subscription_info['character_limit'] * 0.95
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

  # A podcast's content is determined entirely by its lesson and the set of
  # objectives it covers, so multiple users requesting the same lesson +
  # objectives share a single S3 object. Objective ids are sorted to make the
  # key independent of the order they were stored in.
  def self.s3_filename(lesson_id, objective_ids)
    sorted_ids = Array(objective_ids).map(&:to_i).sort
    PODCAST_FOLDER + "student_podcast_#{lesson_id}-#{sorted_ids.join('-')}.mp3"
  end
end
