require 'test_helper'

class AidiffThreadsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @unit_group = create(:unit_group, family_name: 'beepboop')
    @course_offering = create(:course_offering, display_name: 'Course Name')
    @course_version = create(:course_version, content_root: @unit_group, course_offering: @course_offering)
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course2')
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @lesson_group = create(:lesson_group, script: @unit_in_course)
    @lesson = create(:lesson, script: @unit_in_course, lesson_group: @lesson_group)
    create(:script_level, script: @unit_in_course, lesson: @lesson)

    @teacher_sans_experiment = create(:teacher)
    @teacher = create(:teacher)

    create :single_user_experiment, min_user_id: @teacher.id, name: 'ai-differentiation'

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
                },
                metadata: {
                  'url' => 'https://zombo.com'
                }
              }
            ]
          }
        ],
        output: {
          text: "Lorem ipsum dolor sit amet, (source 1) consectetur adipiscing elit,(Sources 42 and 87) sed do eiusmod tempor (source 1, 3, 5) incididunt ut labore et dolore magna aliqua."
        },
        session_id: @session_id
      }
    )
    AiDiffBedrockHelper.stubs(:create_bedrock_client).returns(@bedrock_client)
    @expected_response = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

**See also:**
- [Link 1](https://zombo.com)"
  end

  class AidiffThreadControllerNoPIIViolationTest < AidiffThreadsControllerTest
    setup do
      AidiffThreadsController.any_instance.stubs(:contains_pii?).returns(false)
    end

    test "returns bad_request when creating thread if bad params for lesson context" do
      sign_in @teacher

      post :create, params: {
        context: {
          type: "lesson",
        },
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_response :bad_request
    end

    test "returns bad_request when creating thread if bad params for general context" do
      sign_in @teacher

      post :create, params: {
        context: {
          type: "general"
        },
        isPreset: false,
        presetChipText: nil,
      }

      assert_response :bad_request
    end

    test "returns bad_request when creating thread if no context is provided" do
      sign_in @teacher

      post :create, params: {
        isPreset: false,
        presetChipText: nil,
      }

      assert_response :bad_request
    end

    test "returns forbidden when creating thread if ai_diff experiment isn't enabled" do
      sign_in @teacher_sans_experiment

      post :create, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id,
        },
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_response :forbidden
    end

    test "does not create thread if not a teacher" do
      student = create :student
      create :follower, student_user: student, user: @teacher

      sign_in student

      post :create, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_response :forbidden
    end

    test "create returns success when experiment is enabled" do
      sign_in @teacher

      assert_equal 0, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count

      post :create, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "chat_completion returns success when experiment is enabled and thread exists" do
      sign_in @teacher
      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: @lesson.id, context_type: "lesson")

      post :chat_completion, params: {
        id: @thread.id,
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "chat_completion returns success with unit context and thread exists" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, context_type: "unit")

      post :chat_completion, params: {
        id: @thread.id,
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "chat_completion returns success with course context and thread exists" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, context_type: "course")

      post :chat_completion, params: {
        id: @thread.id,
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "chat_completion returns success with preset text and thread exists" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, context_type: "course")

      post :chat_completion, params: {
        id: @thread.id,
        inputText: "Hello!",
        isPreset: true,
        presetChipText: "Explain a concept",
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: true, preset_chip_text: "Explain a concept").count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: true).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "returns bad_request when getting curriculum_courses if bad params for lesson context" do
      sign_in @teacher

      post :curriculum_courses, params: {
        context: {
          type: "lesson"
        },
      }

      assert_response :bad_request
    end

    test "returns bad_request when getting curriculum_courses if no context type is provided" do
      sign_in @teacher

      post :curriculum_courses, params: {
        context: {
          lessonId: @lesson.id
        },
      }

      assert_response :bad_request
    end

    test "returns forbidden when getting curriculum_courses if ai_diff experiment isn't enabled" do
      sign_in @teacher_sans_experiment

      post :curriculum_courses, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
      }

      assert_response :forbidden
    end

    test "does not get curriculum_courses if not a teacher" do
      student = create :student
      create :follower, student_user: student, user: @teacher

      sign_in student

      post :curriculum_courses, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
      }

      assert_response :forbidden
    end

    test "returns success for curriculum_courses" do
      sign_in @teacher

      post :curriculum_courses, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
      }

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal 2, json_response["courses"].count
      assert_includes(json_response["courses"], "beepboop")
    end
  end

  class AidiffThreadsControllerWithPIIViolationTest < AidiffThreadsControllerTest
    setup do
      AidiffThreadsController.any_instance.stubs(:contains_pii?).returns(true)
    end

    test "return PII violation status if PII detected in the prompt" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, context_type: "course")

      post :chat_completion, params: {
        id: @thread.id,
        inputText: "Hello!",
        isPreset: false,
        presetChipText: nil,
      }

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal SharedConstants::AI_INTERACTION_STATUS[:PII_VIOLATION], json_response["status"]
    end
  end
end
