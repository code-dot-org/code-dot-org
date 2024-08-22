require 'test_helper'

class AiDiffControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @course_offering = create(:course_offering, display_name: 'Course Name')
    @course_version = create(:course_version, :with_unit_group, course_offering: @course_offering)
    @unit_group = @course_version.content_root
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

  test "returns bad_request when getting chat_completion if bad params" do
    sign_in @teacher

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      sessionId: @session_id
    }

    assert_response :bad_request
  end

  test "returns forbidden when getting chat_completion if ai_diff experiment isn't enabled" do
    sign_in @teacher_sans_experiment

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      unitDisplayName: @unitDisplayName,
      sessionId: @session_id
    }

    assert_response :forbidden
  end

  test "does not get chat_completion if not a teacher" do
    student = create :student
    create :follower, student_user: student, user: @teacher

    sign_in student

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      unitDisplayName: "Beowulf Course",
      sessionId: @session_id
    }

    assert_response :forbidden
  end

  test "returns success when experiment is enabled and sets session_id if session_id is absent" do
    sign_in @teacher

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      unitDisplayName: "Beowulf Course",
    }

    json_response = JSON.parse(response.body)
    assert_response :success
    assert_equal @session_id, json_response["session_id"]
    assert_equal "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", json_response["chat_message_text"]
    assert_equal "assistant", json_response["role"]
  end

  test "returns success when experiment is enabled and sets session_id if session_id is nil" do
    sign_in @teacher

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      unitDisplayName: "Beowulf Course",
      session_id: nil
    }

    json_response = JSON.parse(response.body)
    assert_response :success
    assert_equal @session_id, json_response["session_id"]
    assert_equal "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", json_response["chat_message_text"]
    assert_equal "assistant", json_response["role"]
  end

  test "returns success when experiment is enabled and session_id is absent" do
    sign_in @teacher

    post :chat_completion, params: {
      inputText: "Hello!",
      lessonId: @lesson.id,
      unitDisplayName: "Beowulf Course",
      sessionId: @session_id
    }

    json_response = JSON.parse(response.body)
    assert_response :success
    assert_equal @session_id, json_response["session_id"]
    assert_equal "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", json_response["chat_message_text"]
    assert_equal "assistant", json_response["role"]
  end
end
