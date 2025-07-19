require 'test_helper'

class AiDiffControllerTest < ActionController::TestCase
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
    @unit_display_name = "Beowulf Course"

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

  class AiDiffControllerNoPIIViolationTest < AiDiffControllerTest
    setup do
      AiDiffController.any_instance.stubs(:contains_pii?).returns(false)
    end

    test "returns bad_request when getting chat_completion if bad params for lesson context" do
      sign_in @teacher

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        sessionId: @session_id,
        isPreset: false
      }

      assert_response :bad_request
    end

    test "returns bad_request when getting chat_completion if bad params for general context" do
      sign_in @teacher

      post :chat_completion, params: {
        context: {
          type: "general"
        },
        sessionId: @session_id,
        isPreset: false,
      }

      assert_response :bad_request
    end

    test "returns bad_request when getting chat_completion if no context is provided" do
      sign_in @teacher

      post :chat_completion, params: {
        sessionId: @session_id,
        isPreset: false
      }

      assert_response :bad_request
    end

    test "returns forbidden when getting chat_completion if ai_diff experiment isn't enabled" do
      sign_in @teacher_sans_experiment

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id,
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      assert_response :forbidden
    end

    test "does not get chat_completion if not a teacher" do
      student = create :student
      create :follower, student_user: student, user: @teacher

      sign_in student

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      assert_response :forbidden
    end

    test "returns success when experiment is enabled and sets session_id if session_id is absent" do
      sign_in @teacher

      assert_equal 0, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        isPreset: false
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @session_id, json_response["session_id"]
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "returns success when experiment is enabled and sets session_id if session_id is nil" do
      sign_in @teacher

      assert_equal 0, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        session_id: nil,
        isPreset: false
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @session_id, json_response["session_id"]
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "returns success when experiment is enabled and session_id is present" do
      sign_in @teacher
      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: @lesson.id, context_type: "lesson")

      post :chat_completion, params: {
        context: {
          type: "lesson",
          lessonId: @lesson.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @session_id, json_response["session_id"]
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "returns success with unit context and session_id set" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, context_type: "unit")

      post :chat_completion, params: {
        context: {
          type: "unit",
          unitId: @unit_in_course.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @session_id, json_response["session_id"]
      assert_equal @expected_response, json_response["chat_message_text"]
      assert_equal "assistant", json_response["role"]
    end

    test "returns success with course context and session_id set" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, context_type: "course")

      post :chat_completion, params: {
        context: {
          type: "course",
          courseId: @unit_group.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      assert_equal 1, AidiffThread.where(user_id: @teacher.id, external_id: @session_id).count
      thread = AidiffThread.where(user_id: @teacher.id, external_id: @session_id).first
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :user, content: "Hello!", is_preset: false).count
      assert_equal 1, AidiffMessage.where(aidiff_thread_id: thread.id, external_id: @session_id, role: :assistant, content: @expected_response, is_preset: false).count

      assert_equal 2, thread.aidiff_messages.count

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal @session_id, json_response["session_id"]
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

  class AiDiffControllerWithPIIViolationTest < AiDiffControllerTest
    setup do
      AiDiffController.any_instance.stubs(:contains_pii?).returns(true)
    end

    test "return PII violation status if PII detected in the prompt" do
      sign_in @teacher

      @thread = create(:aidiff_thread, external_id: @session_id, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, context_type: "course")

      post :chat_completion, params: {
        context: {
          type: "course",
          courseId: @unit_group.id
        },
        inputText: "Hello!",
        unitDisplayName: @unit_display_name,
        sessionId: @session_id,
        isPreset: false
      }

      json_response = JSON.parse(response.body)
      assert_response :success
      assert_equal SharedConstants::AI_INTERACTION_STATUS[:PII_VIOLATION], json_response["status"]
    end
  end
end
