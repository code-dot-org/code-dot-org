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

  test 'Testing prompt formatting for lesson' do
    context = SharedConstants::AI_DIFF_CONTEXT[:LESSON]
    course_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    prompt = AiDiffBedrockHelper.get_prompt_for_context(context, course_name, unit_name, lesson_name)
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is Computer Science Discoveries CSD Unit 3, Test Lesson Name.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for unit' do
    context = SharedConstants::AI_DIFF_CONTEXT[:UNIT]
    course_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    prompt = AiDiffBedrockHelper.get_prompt_for_context(context, course_name, unit_name, lesson_name)
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the Computer Science Discoveries course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is Computer Science Discoveries CSD Unit 3.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for course' do
    context = SharedConstants::AI_DIFF_CONTEXT[:COURSE]
    course_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    prompt = AiDiffBedrockHelper.get_prompt_for_context(context, course_name, unit_name, lesson_name)
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the Computer Science Discoveries course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is Computer Science Discoveries.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing input formatting for retrieve and generate request' do
    input = "Hello there!"
    prompt = "prompt text"
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
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
              text_prompt_template: "prompt text"
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
                filter: {},
                number_of_results: 10,
              }
            }
        }
      }
    }
    assert_equal formatted_input, expected_input
  end

  test 'Testing context filtering for lesson' do
    input = "Hello there!"
    prompt = "prompt text"
    course_name = "test_course"
    unit_num = 2
    lesson_number = 3
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
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
              text_prompt_template: "prompt text"
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
                and_all: [
                  {or_all: [
                    {equals: {key: "lesson", value: "L03"}},
                    {equals: {key: "lesson", value: "all"}}
                  ]},
                  {or_all: [
                    {equals: {key: "unit", value: "U2"}},
                    {equals: {key: "unit", value: "all"}}
                  ]},
                  {equals: {key: "course", value: "test_course"}},
                ]
              },
              number_of_results: 10,
            }
          }
        }
      }
    }
    filtered_input = AiDiffBedrockHelper.filter_for_context(formatted_input, lesson_number, unit_num, course_name)
    assert_equal filtered_input, expected_input
  end

  test 'Testing context filtering for unit' do
    input = "Hello there!"
    prompt = "prompt text"
    course_name = "test_course"
    unit_num = 2
    lesson_number = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
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
              text_prompt_template: "prompt text"
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
                and_all: [
                  {or_all: [
                    {equals: {key: "unit", value: "U2"}},
                    {equals: {key: "unit", value: "all"}}
                  ]},
                  {equals: {key: "course", value: "test_course"}},
                ]
              },
              number_of_results: 10,
            }
          }
        }
      }
    }
    filtered_input = AiDiffBedrockHelper.filter_for_context(formatted_input, lesson_number, unit_num, course_name)
    assert_equal filtered_input, expected_input
  end

  test 'Testing context filtering for course' do
    input = "Hello there!"
    prompt = "prompt text"
    course_name = "test_course"
    unit_num = nil
    lesson_number = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
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
              text_prompt_template: "prompt text"
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
                equals: {key: "course", value: "test_course"}
              },
              number_of_results: 10,
            }
          }
        }
      }
    }
    filtered_input = AiDiffBedrockHelper.filter_for_context(formatted_input, lesson_number, unit_num, course_name)
    assert_equal filtered_input, expected_input
  end

  test 'Testing rag generation call with session' do
    input = "Hello there!"
    prompt = "a well crafted prompt"
    course_name = "test_course"
    unit_num = 3
    lesson_number = 5
    response = AiDiffBedrockHelper.request_bedrock_rag_chat(input, prompt, lesson_number, unit_num, course_name, @session_id)
    assert_equal response.output.text, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    assert_equal response.session_id, "1234"
    assert_equal response.citations[0].generated_response_part.text_response_part.text, "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    assert_equal response.citations[0].retrieved_references[0].content.text, "Hwaet! We gar-dena in geardagum, theod-cyninga thrym gefrunon"
  end
end
