module AiDiffBedrockHelper
  MAX_TOKENS = 1500
  TEMP = 0.5
  MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
  # TODO: extract this to a secret or other centralized parameter once KB is deployed via cloudformation.
  KB_ID = 'ODWSNBOEZG'
  RETRIEVAL_LIMIT = 10

  def self.create_bedrock_client
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

  def self.get_prompt_supplement(section_contexts)
    return "" unless section_contexts
    prompt = "\nThe courses that this teacher may ask you about are:"
    section_contexts.each do |context|
      prompt = format("%{prompt}\n - %{course_name}", prompt: prompt, course_name: context[:course_display_name])
    end
    prompt
  end

  def self.populate_new_session_messages(messages, input)
    new_input_text = "This is a continuation of a previous conversation. The previous messages are:"
    messages.each do |msg|
      new_input_text << "\n\n#{msg.user? ? "User" : "Assistant"}: #{msg.raw_content}"
    end
    new_input_text << "\n\n\n**The current message that you should respond to is:**\nUser: #{input}"
  end

  def self.get_prompt_for_context(context, course_name, unit_name, lesson_name, is_preset, section_contexts, level_instructions, student_code)
    case context
    when SharedConstants::AI_DIFF_CONTEXT[:LEVEL]
      prompt =
        if student_code.present?
          format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

            The teacher is currently working on a level within that lesson. The instructions for this task are: %{level_instructions}

            The student code the teacher is viewing is: %{student_code}

            If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

            Here are the search results in numbered order:
            $search_results$",
            course_name:, unit_name:, lesson_name:, level_instructions:,
            # Truncate student code to 75,000 characters to stay comfortably under AWS 100,000 character limit.
            student_code: format("%.75000s", student_code[:student_code])
          )
        else
          format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

            The teacher is currently working on a level within that lesson. The instructions for this task are: %{level_instructions}

            If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

            Here are the search results in numbered order:
            $search_results$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name, level_instructions: level_instructions
          )
        end
    when SharedConstants::AI_DIFF_CONTEXT[:LESSON]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:UNIT]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the %{course_name} course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is %{course_name} %{unit_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name, unit_name: unit_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:COURSE]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the %{course_name} course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is %{course_name}.

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", course_name: course_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.%{section_contexts}

      If asked about a student, tell the teacher that you do not have context on the teacher's students and that the team is working on adding that functionality. And tell the teacher that the team will let them know when they can chat about the work of specific students.

      Here are the search results in numbered order:
      $search_results$", section_contexts: get_prompt_supplement(section_contexts)
      )
    end
    unless is_preset
      prompt = format("%{prompt}

      $output_format_instructions$", prompt: prompt
      )
    end
    prompt
  end

  def self.format_inputs_for_bedrock_request(input, prompt)
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

  def self.filter_for_context(lesson_number, unit_num, course_names, section_contexts, labs = [])
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

  def self.request_bedrock_rag_chat(input, prompt, lesson_number, unit_num, course_name, session_id, section_contexts, labs = [])
    config = format_inputs_for_bedrock_request(input, prompt)
    config[:session_id] = session_id unless session_id.nil?
    filter_config = filter_for_context(lesson_number, unit_num, course_name, section_contexts, labs)
    config[:retrieve_and_generate_configuration][:knowledge_base_configuration][:retrieval_configuration][:vector_search_configuration][:filter] = filter_config

    response = create_bedrock_client.retrieve_and_generate(
      config
    )

    format_rag_response(response)
  end

  def self.format_rag_response(response)
    text = response.output.text.dup

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
    }
  end
end
