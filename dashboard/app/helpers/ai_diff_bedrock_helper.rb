module AiDiffBedrockHelper
  MAX_TOKENS = 1500
  TEMP = 0.5
  MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
  # TODO: extract this to a secret or other centralized parameter once KB is deployed via cloudformation.
  KB_ID = 'ODWSNBOEZG'
  RETRIEVAL_LIMIT = 10

  def self.create_bedrock_client
    Aws::BedrockAgentRuntime::Client.new
  end

  def self.get_prompt_for_context(context, course_name, unit_name, lesson_name)
    case context
    when SharedConstants::AI_DIFF_CONTEXT[:LESSON]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the %{course_name} course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is %{course_name} %{unit_name}, %{lesson_name}.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:UNIT]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the %{course_name} course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is %{course_name} %{unit_name}.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:COURSE]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the %{course_name} course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is %{course_name}.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
      )
    when SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$", course_name: course_name, unit_name: unit_name, lesson_name: lesson_name
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

  def self.filter_for_context(config, lesson_number, unit_num, course_name)
    temp_filters = []
    unless lesson_number.nil?
      temp_filters.push(
        or_all: [
          {equals: {key: "lesson", value: format("L%02d", lesson_number)}},
          {equals: {key: "lesson", value: "all"}}
        ]
      )
    end
    unless unit_num.nil?
      temp_filters.push(
        or_all: [
          {equals: {key: "unit", value: format("U%02d", unit_num)}},
          {equals: {key: "unit", value: "all"}}
        ]
      )
    end
    temp_filters.push({equals: {key: "course", value: course_name}}) unless course_name.nil?

    if lesson_number.nil? && unit_num.nil? && course_name.nil?
      temp_filters.push({equals: {key: "scope", value: "general"}})
    end

    #can't use "and_all" if there is only 1 expression to filter on, only 2+
    if temp_filters.length > 1
      config[:retrieve_and_generate_configuration][:knowledge_base_configuration][:retrieval_configuration][:vector_search_configuration][:filter] = {
        and_all: temp_filters
      }
    elsif temp_filters.length == 1
      config[:retrieve_and_generate_configuration][:knowledge_base_configuration][:retrieval_configuration][:vector_search_configuration][:filter] = temp_filters[0]
    end
    config
  end

  def self.request_bedrock_rag_chat(input, prompt, lesson_number, unit_num, course_name, session_id)
    config = format_inputs_for_bedrock_request(input, prompt)
    config[:session_id] = session_id unless session_id.nil?
    config = filter_for_context(config, lesson_number, unit_num, course_name)

    response = create_bedrock_client.retrieve_and_generate(
      config
    )
    response
  end
end
