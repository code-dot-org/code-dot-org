module AiDiffBedrockHelper
  include UsersHelper

  MAX_TOKENS = 1500
  TEMP = 0.5
  MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
  # TODO: extract this to a secret or other centralized parameter once KB is deployed via cloudformation.
  KB_ID = 'ODWSNBOEZG'
  RETRIEVAL_LIMIT = 10

  class AidiffJsonError < StandardError
    def message
      "Json does not match the schema"
    end
  end

  def create_bedrock_client
    if (Rails.application.config.respond_to?(:stub_aichat_external_services) && Rails.application.config.stub_aichat_external_services) || [:development, :test].include?(rack_env)
      client = Aws::BedrockAgentRuntime::Client.new(stub_responses: true)
      client.stub_responses(
        :retrieve_and_generate, {
          citations: [
            {
              generated_response_part: {
                text_response_part: {
                  span: {
                    end: 55,
                    start: 0
                  },
                  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                }
              },
              retrieved_references: [
                {
                  content: {
                    text: "Hwaet! We gar-dena in geardagum, theod-cyninga thrym gefrunon"
                  },
                  location: {
                    s3_location: {
                      uri: "s3://dummy_file"
                    },
                    type: "S3"
                  },
                  metadata: {
                    'url' => 'https://zombo.com'
                  }
                }
              ]
            }
          ],
          output: {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          },
          session_id: "fake_session_id"
        }
      )
      return client
    else
      Aws::BedrockAgentRuntime::Client.new
    end
  end

  def populate_new_session_messages(messages, input)
    new_input_text = "This is a continuation of a previous conversation. The previous messages are:"
    messages.each do |msg|
      new_input_text << "\n\n#{msg.user? ? "User" : "Assistant"}: #{msg.raw_content}"
    end
    new_input_text << "\n\n\n**The current message that you should respond to is:**\nUser: #{input}"
  end

  def format_inputs_for_bedrock_request(input, prompt)
    # Add system prompt and retrieval contexts if available to inputs as part of instructions that will be sent to model.
    {
      input: {
        text: input
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: KB_ID,
          model_arn: MODEL_ARN,
          generation_configuration: {
            prompt_template: {
              text_prompt_template: prompt
            },
            inference_config: {
              text_inference_config: {
                max_tokens: MAX_TOKENS,
                temperature: TEMP,
              }
            },
          },
          retrieval_configuration: {
            vector_search_configuration: {
              filter: {},
              number_of_results: RETRIEVAL_LIMIT,
            }
          }
        }
      }
    }
  end

  def filter_for_context(lesson_number, unit_num, course_names, section_contexts, labs = [])
    filter_config = {}
    and_all_filters = []
    or_all_filters = []
    unless lesson_number.nil?
      and_all_filters.push(
        or_all: [
          {equals: {key: "lesson", value: format("L%02d", lesson_number)}},
          {equals: {key: "lesson", value: "all"}},
          labs.empty? ? nil : {in: {key: 'lab', value: labs}}
        ].compact
      )
    end
    unless unit_num.nil?
      and_all_filters.push(
        or_all: [
          {equals: {key: "unit", value: format("U%02d", unit_num)}},
          {equals: {key: "unit", value: "all"}},
          labs.empty? ? nil : {in: {key: 'lab', value: labs}}
        ].compact
      )
    end
    unless course_names.nil?
      if labs.empty?
        and_all_filters.push({in: {key: "course", value: course_names}})
      else
        and_all_filters.push(
          or_all: [
            {in: {key: "course", value: course_names}},
            {in: {key: 'lab', value: labs}}
          ]
        )
      end
    end

    if lesson_number.nil? && unit_num.nil? && course_names.nil?
      or_all_filters.push({equals: {key: "scope", value: "general"}})
      section_contexts&.each do |section_context|
        or_all_filters.push({in: {key: "course", value: section_context[:course_names]}})
      end
      or_all_filters.push({in: {key: 'lab', value: labs}}) unless labs.empty?
    end

    #can't use "and_all" if there is only 1 expression to filter on, only 2+
    curriculum_filter = if and_all_filters.length > 1
                          {and_all: and_all_filters}
                        elsif and_all_filters.length == 1
                          and_all_filters[0]
                        else
                          nil
                        end
    or_all_filters.push(curriculum_filter) unless curriculum_filter.nil?

    # Ideally we'd be able to include the code docs this way instead of tacking
    # them onto each of the and_all_filters above, but that causes us to exceed
    # AWS's two-level nesting limit for filter conditions
    # TODO: revisit this if/when the filter depth limit changes.
    # or_all_filters.push({in: {key: 'lab', value: labs}}) unless labs.empty?

    #can't use "or_all" if there is only 1 expression to filter on, only 2+
    if or_all_filters.length > 1
      filter_config = {
        or_all: or_all_filters
      }
    elsif or_all_filters.length == 1
      filter_config = or_all_filters[0]
    end
    filter_config
  end

  def request_bedrock_rag_chat(
    input,
    prompt,
    lesson_number,
    unit_num,
    course_name,
    session_id,
    section_contexts,
    labs,
    artifact_type
  )
    config = format_inputs_for_bedrock_request(input, prompt)
    config[:session_id] = session_id unless session_id.nil?
    filter_config = filter_for_context(lesson_number, unit_num, course_name, section_contexts, labs)
    config[:retrieve_and_generate_configuration][:knowledge_base_configuration][:retrieval_configuration][:vector_search_configuration][:filter] = filter_config

    attempts = 0
    begin
      response = create_bedrock_client.retrieve_and_generate(
        config
      )
      if artifact_type
        if json_post_process(response.output.text.dup).nil?
          raise AidiffJsonError
        else
          return format_rag_response(response, artifact_type, true)
        end
      end
    rescue AidiffJsonError
      if (attempts += 1) < 2
        retry
      else
        return format_rag_response(response, artifact_type)
      end
    end
    format_rag_response(response, artifact_type)
  end

  def json_post_process(text)
    match = text.match(/(\{(?:.|\n)*\})/)
    if match
      json_string = match[0]
      return json_string
    end
    return nil
  end

  def format_rag_response(response, artifact_type, is_json = false)
    text = response.output.text.dup

    if artifact_type && is_json
      #fix json
      json_text = json_post_process(text)

      valid = JSON::Validator.validate(AidiffPromptHelper::EXIT_TICKET_SCHEMA, json_text) if artifact_type == SharedConstants::AI_DIFF_ARTIFACT_TYPE[:EXIT_TICKET]
      valid = JSON::Validator.validate(AidiffPromptHelper::LESSON_HOOK_SCHEMA, json_text) if artifact_type == SharedConstants::AI_DIFF_ARTIFACT_TYPE[:LESSON_HOOK]
      if json_text
        text = json_text
      end
    end
    # Remove useless references such as '(Sources 1 and 7)' from the response
    text.gsub!(/ ?\([Ss]ource[^)]+\)/, '')

    # Gather and append links
    reference_urls = response.citations.flat_map do |citation|
      citation.retrieved_references.map do |ref|
        ref.metadata&.[]('url')
      end
    end.sort.uniq

    if reference_urls.any?
      text << "\n\n**See also:**"
      reference_urls.each_with_index do |url, index|
        text << "\n- [Link #{index+1}](#{url})"
      end
    end
    {
      content: text,
      raw_content: response.output.text,
      links: reference_urls.any? ? reference_urls : nil,
      session_id: response.session_id,
      status: ((artifact_type && valid) || !artifact_type) ? SharedConstants::AI_INTERACTION_STATUS[:OK] : SharedConstants::AI_INTERACTION_STATUS[:ERROR],
      is_artifact_candidate: (artifact_type && valid),
      artifact_type: artifact_type,
    }
  end

  ALPHABET = ('a'..'z').to_a

  def progress_csv_for_all_sections(section_contexts)
    return [] unless section_contexts.respond_to?(:map)

    section_contexts.map do |section_context|
      section = section_context[:section]
      progress_csv_for_students(section.students.distinct, section.default_script)
    end
  end

  def progress_csv_for_students(students, unit)
    student_progress = script_progress_for_users(students, unit)[0]
    level_names, progress_table = get_csv_level_data(unit, students, student_progress)
    headers = ['Student Name'].concat(level_names)

    CSV.generate do |csv|
      csv << headers
      progress_table.each do |data_row|
        csv << [data_row[:student_name]].concat(level_names.map {|column_name| data_row[column_name]})
      end
    end
  end

  def get_csv_level_data(unit, students, student_progress)
    progress_table = students.map do |student|
      {student_name: student.name, student_id: student.id}
    end

    level_names = []

    unit.lessons.each do |lesson|
      lesson.script_levels.each do |script_level|
        next if script_level.assessment?

        level_id = script_level.oldest_active_level.id || script_level.id
        level_text = "#{lesson.relative_position}.#{script_level.level_display_text}"

        if script_level.bubble_choice?
          sublevels = script_level.level.sublevels
          sublevels.each_with_index do |sublevel, index|
            sublevel_name = "#{level_text}#{ALPHABET[index]}"
            level_names << sublevel_name

            add_level_data_for_all_students(progress_table, student_progress, sublevel.id, sublevel_name, sublevel.validated?)
          end
        else
          add_level_data_for_all_students(progress_table, student_progress, level_id, level_text, script_level.level.validated?)
          level_names << level_text
        end
      end
    end

    [level_names, progress_table]
  end

  def add_level_data_for_all_students(progress_table, student_progress, level_id, level_text, is_validated_level)
    progress_table.each do |data_row|
      level_progress_for_student = student_progress[data_row[:student_id]][level_id]

      status = level_progress_for_student ? level_progress_for_student[:status] : 'not_tried'

      parsed_status = case status
                      when 'not_tried'
                        'N'
                      when 'passed', 'perfect', 'submitted', 'completed_assessment', 'free_play_complete'
                        if is_validated_level
                          'V'
                        else
                          'S'
                        end
                      when 'attempted'
                        'A'
                      end

      data_row[level_text] = parsed_status
    end
  end
end
