require 'test_helper'

class AiDiffBedrockHelperTest < ActionView::TestCase
  include AiDiffBedrockHelper

  setup do
    @session_id = "1234"
    @bedrock_client = Aws::BedrockAgentRuntime::Client.new(stub_responses: true)
    @bedrock_client.stub_responses(
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
        session_id: @session_id
      }
    )
    AiDiffBedrockHelper.stubs(:create_bedrock_client).returns(@bedrock_client)
  end

  test 'Testing prompt formatting for differentiation' do
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    prompt = AiDiffBedrockHelper.get_prompt(unit_name, lesson_name)
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries (CSD) course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
    The current lesson this teacher is working on is CSD Unit 3, Test Lesson Name.

    Here are the search results in numbered order:
    $search_results$

    $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing input formatting for retrieve and generate request' do
    input = "Hello there!"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    lesson_number = 3
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, lesson_name, lesson_number, unit_name)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: '1WHRENJ0OA',
          model_arn: 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
          generation_configuration: {
            prompt_template: {
              text_prompt_template: "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries (CSD) course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
    The current lesson this teacher is working on is CSD Unit 3, Test Lesson Name.

    Here are the search results in numbered order:
    $search_results$

    $output_format_instructions$"
            },
            inference_config: {
              text_inference_config: {
                max_tokens: 1500,
                temperature: 0.5,
              }
            },
          },
            retrieval_configuration: {
              vector_search_configuration: {
                filter: {
                  or_all: [
                    {equals: {key: "lesson", value: "L03"}},
                    {equals: {key: "lesson", value: "all"}}
                  ]
                },
                number_of_results: 10,
              }
            }
        }
      }
    }
    assert_equal formatted_input, expected_input
  end

  test 'Testing rag generation call with session' do
    input = "Hello there!"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    lesson_number = 3
    response = AiDiffBedrockHelper.request_bedrock_rag_chat(input, lesson_name, lesson_number, unit_name, @session_id)
    puts response
    assert_equal response.output.text, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    assert_equal response.session_id, "1234"
    assert_equal response.citations[0].generated_response_part.text_response_part.text, "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    assert_equal response.citations[0].retrieved_references[0].content.text, "Hwaet! We gar-dena in geardagum, theod-cyninga thrym gefrunon"
  end
end
