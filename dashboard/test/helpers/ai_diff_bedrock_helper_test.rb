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

  test 'Test previous message concatenation' do
    thread = create(:aidiff_thread, external_id: @session_id, user: create(:teacher), llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: 10, unit_id: nil, lesson_id: nil, context_type: "course")
    create(:aidiff_message, aidiff_thread: thread, role: :user, content: "hello", raw_content: "hello")
    create(:aidiff_message, aidiff_thread: thread, content: "beep boop", raw_content: "beep boop")
    create(:aidiff_message, aidiff_thread: thread, role: :user, content: "open the pod bay doors", raw_content: "open the pod bay doors")
    create(:aidiff_message, aidiff_thread: thread, content: "I'm afraid I can't do that Dave", raw_content: "I'm afraid I can't do that Dave")
    input = AiDiffBedrockHelper.populate_new_session_messages(thread.aidiff_messages, "oh no")
    expected_input = "This is a continuation of a previous conversation. The previous messages are:

User: hello

Assistant: beep boop

User: open the pod bay doors

Assistant: I'm afraid I can't do that Dave


**The current message that you should respond to is:**
User: oh no"
    assert_equal input, expected_input
  end

  test 'Testing prompt formatting for level, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:LEVEL]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = false
    section_contexts = nil
    level_instructions = 'sudo make me a sandwich'
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is Computer Science Discoveries CSD Unit 3, Test Lesson Name.

            The teacher is currently working on a level within that lesson. The instructions for this task are: sudo make me a sandwich

            Here are the search results in numbered order:
            $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for level, not preset, with student code' do
    context = SharedConstants::AI_DIFF_CONTEXT[:LEVEL]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = false
    section_contexts = nil
    level_instructions = 'sudo make me a sandwich'
    student_code = {student_code: 'print "Hello, world!";'}
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
            The current lesson this teacher is working on is Computer Science Discoveries CSD Unit 3, Test Lesson Name.

            The teacher is currently working on a level within that lesson. The instructions for this task are: sudo make me a sandwich

            The student code the teacher is viewing is: print \"Hello, world!\";

            Here are the search results in numbered order:
            $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for lesson, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:LESSON]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = false
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is Computer Science Discoveries CSD Unit 3, Test Lesson Name.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for unit, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:UNIT]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = false
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the Computer Science Discoveries course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is Computer Science Discoveries CSD Unit 3.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for course, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:COURSE]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = false
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the Computer Science Discoveries course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is Computer Science Discoveries.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for general, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
    course_display_name = nil
    unit_name = nil
    lesson_name = nil
    is_preset = false
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for general with sections, not preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
    course_display_name = nil
    unit_name = nil
    lesson_name = nil
    is_preset = false
    section_contexts = [
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Fake Course A",
        course_names: ["fake_a"]
      },
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Phony Class B",
        course_names: ["fake_b"]
      }
    ]
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
The courses that this teacher may ask you about are:
 - Fake Course A
 - Phony Class B

      Here are the search results in numbered order:
      $search_results$

      $output_format_instructions$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for lesson, is preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:LESSON]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = true
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant lesson planning tasks. Your focus is on helping teachers with lesson plans for lesson in the Computer Science Discoveries course. The teacher will either ask you questions about the current lesson plan and resources or ask you to make changes to or create new material for the lesson. When creating new material for the lesson, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current lesson this teacher is working on is Computer Science Discoveries CSD Unit 3, Test Lesson Name.

      Here are the search results in numbered order:
      $search_results$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for unit, is preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:UNIT]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = true
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with lesson plans in the Computer Science Discoveries course. The teacher will either ask you questions about the current unit's lesson plans and resources or ask you to make changes to or create new material for this unit. When creating new material for this unit, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current unit this teacher is working on is Computer Science Discoveries CSD Unit 3.

      Here are the search results in numbered order:
      $search_results$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for course, is preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:COURSE]
    course_display_name = "Computer Science Discoveries"
    unit_name = "CSD Unit 3"
    lesson_name = "Test Lesson Name"
    is_preset = true
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. Your focus is on helping teachers with the Computer Science Discoveries course. The teacher will either ask you questions about the current course plan and resources or ask you to make changes to or create new material for this course. When creating new material for the course, you must provide all the information a teacher needs. For example, if asked to create a quiz you should also provide the answer key. Your job is to use the information from the search results to help the teacher to the best of your ability, asking clarifying questions if needed. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
      The current course this teacher is working on is Computer Science Discoveries.

      Here are the search results in numbered order:
      $search_results$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for general, is preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
    course_display_name = nil
    unit_name = nil
    lesson_name = nil
    is_preset = true
    section_contexts = nil
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.

      Here are the search results in numbered order:
      $search_results$"
    assert_equal prompt, expected_prompt
  end

  test 'Testing prompt formatting for general with sections, is preset' do
    context = SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
    course_display_name = nil
    unit_name = nil
    lesson_name = nil
    is_preset = true
    section_contexts = [
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Fake Course A",
        course_names: ["fake_a"]
      },
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Phony Class B",
        course_names: ["fake_b"]
      }
    ]
    level_instructions = nil
    student_code = nil
    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context,
      course_display_name,
      unit_name,
      lesson_name,
      is_preset,
      section_contexts,
      level_instructions,
      student_code
    )
    expected_prompt = "You are a teaching assistant named Aida. It's your job to help K-12 computer science teachers using the code.org platform plan their lessons and adjust lesson plans to fit class time requirements, help students that are ahead or behind, provide alternate explanations of the material, and other relevant teaching tasks. You also provide support with using the code.org platform. Your responses should be warm and helpful because you're the best lesson planner there could be, and you know all about computer science education.
The courses that this teacher may ask you about are:
 - Fake Course A
 - Phony Class B

      Here are the search results in numbered order:
      $search_results$"
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
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    course_names = ["test_course"]
    unit_num = 2
    lesson_number = 3
    section_contexts = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    expected_filter = {
      and_all: [
        {or_all: [
          {equals: {key: "lesson", value: "L03"}},
          {equals: {key: "lesson", value: "all"}}
        ]},
        {or_all: [
          {equals: {key: "unit", value: "U02"}},
          {equals: {key: "unit", value: "all"}}
        ]},
        {in: {key: "course", value: ["test_course"]}},
      ]
    }
    assert_equal formatted_input, expected_input
    filter = AiDiffBedrockHelper.filter_for_context(lesson_number, unit_num, course_names, section_contexts)
    assert_equal filter, expected_filter
  end

  test 'Testing context filtering for unit' do
    input = "Hello there!"
    prompt = "prompt text"
    course_names = ["test_course"]
    unit_num = 2
    lesson_number = nil
    section_contexts = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    expected_filter = {
      and_all: [
        {or_all: [
          {equals: {key: "unit", value: "U02"}},
          {equals: {key: "unit", value: "all"}}
        ]},
        {in: {key: "course", value: ["test_course"]}},
      ]
    }
    assert_equal formatted_input, expected_input
    filter = AiDiffBedrockHelper.filter_for_context(lesson_number, unit_num, course_names, section_contexts)
    assert_equal filter, expected_filter
  end

  test 'Testing context filtering for course' do
    input = "Hello there!"
    prompt = "prompt text"
    course_names = ["test_course"]
    unit_num = nil
    lesson_number = nil
    section_contexts = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    expected_filter = {
      in: {key: "course", value: ["test_course"]}
    }
    assert_equal formatted_input, expected_input
    filter = AiDiffBedrockHelper.filter_for_context(lesson_number, unit_num, course_names, section_contexts)
    assert_equal filter, expected_filter
  end

  test 'Testing context filtering for general context' do
    input = "Hello there!"
    prompt = "prompt text"
    course_names = nil
    unit_num = nil
    lesson_number = nil
    section_contexts = nil
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    expected_filter = {
      equals: {key: "scope", value: "general"}
    }
    assert_equal formatted_input, expected_input
    filter = AiDiffBedrockHelper.filter_for_context(lesson_number, unit_num, course_names, section_contexts)
    assert_equal filter, expected_filter
  end

  test 'Testing context filtering for general context with sections' do
    input = "Hello there!"
    prompt = "prompt text"
    course_names = nil
    unit_num = nil
    lesson_number = nil
    section_contexts = [
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Fake Course A",
        course_names: ["fake_a"]
      },
      {
        context: SharedConstants::AI_DIFF_CONTEXT[:COURSE],
        course_display_name: "Phony Class B",
        course_names: ["fake_b"]
      }
    ]
    formatted_input = AiDiffBedrockHelper.format_inputs_for_bedrock_request(input, prompt)
    expected_input = {
      input: {
        text: "Hello there!"
      },
      retrieve_and_generate_configuration: {
        type: 'KNOWLEDGE_BASE',
        knowledge_base_configuration: {
          knowledge_base_id: AiDiffBedrockHelper::KB_ID,
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
    expected_filter = {
      or_all: [
        {equals: {key: "scope", value: "general"}},
        {in: {key: "course", value: ["fake_a"]}},
        {in: {key: "course", value: ["fake_b"]}}
      ]
    }
    assert_equal formatted_input, expected_input
    filter = AiDiffBedrockHelper.filter_for_context(lesson_number, unit_num, course_names, section_contexts)
    assert_equal filter, expected_filter
  end

  test 'Testing rag generation call with session' do
    input = "Hello there!"
    prompt = "a well crafted prompt"
    course_names = ["test_course"]
    unit_num = 3
    lesson_number = 5
    section_contexts = nil

    response = AiDiffBedrockHelper.request_bedrock_rag_chat(input, prompt, lesson_number, unit_num, course_names, @session_id, section_contexts)
    assert_equal response[:content], "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    assert_equal response[:raw_content], "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    assert_equal response[:session_id], "1234"
    assert_nil response[:links]
  end
end
