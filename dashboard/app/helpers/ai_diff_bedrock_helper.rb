module AiDiffBedrockHelper
  MAX_TOKENS = 1500
  TEMP = 0.5
  MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
  KB_ID = '1WHRENJ0OA'
  RETRIEVAL_LIMIT = 10

  def self.create_bedrock_client
    Aws::BedrockAgentRuntime::Client.new
  end

  def self.get_prompt(unit_name, lesson_name)
    prompt = format("You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries (CSD) course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
    The current lesson this teacher is working on is %{unit_name}, %{lesson_name}.

    Here are the search results in numbered order:
    $search_results$

    $output_format_instructions$", unit_name: unit_name, lesson_name: lesson_name
    )
    prompt
  end

  def self.format_inputs_for_bedrock_request(input, lesson_name, lesson_number, unit_name)
    # Add system prompt and retrieval contexts if available to inputs as part of instructions that will be sent to model.
    prompt = get_prompt(unit_name, lesson_name)
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
              filter: {
                or_all: [
                  {equals: {key: "lesson", value: format("L%02d", lesson_number)}},
                  {equals: {key: "lesson", value: "all"}}
                ]
              },
              number_of_results: RETRIEVAL_LIMIT,
            }
          }
        }
      }
    }
  end

  def self.request_bedrock_rag_chat(input, lesson_name, lesson_number, unit_name, session_id)
    config = format_inputs_for_bedrock_request(input, lesson_name, lesson_number, unit_name)
    config[:session_id] = session_id unless session_id.nil?
    response = create_bedrock_client.retrieve_and_generate(
      config
    )
    response
  end
end
