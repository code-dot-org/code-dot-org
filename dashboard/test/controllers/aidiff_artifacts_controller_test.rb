require 'test_helper'

class AidiffArtifactsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher_sans_experiment = create(:teacher)
    @teacher = create(:teacher)

    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher_sans_experiment.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-artifact')

    @unit_group = create(:unit_group, family_name: 'beepboop')
    @course_offering = create(:course_offering, display_name: 'Course Name')
    @course_version = create(:course_version, content_root: @unit_group, course_offering: @course_offering)
    @unit_in_course = create(:script)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @lesson_group = create(:lesson_group, script: @unit_in_course)
    @lesson = create(:lesson, script: @unit_in_course, lesson_group: @lesson_group)
  end

  test "index redirects to signin when teacher not signed in" do
    get :index
    assert_redirected_to_sign_in
  end

  test "index returns forbidden when teacher not in experiment" do
    sign_in @teacher_sans_experiment
    get :index
    assert_response :forbidden
  end

  test "index returns only user-owned exit tickets" do
    #some other user's exit ticket
    @teacher2 = create(:teacher)
    create(:single_user_experiment, min_user_id: @teacher2.id, name: 'ai-differentiation')
    create(:aidiff_exit_ticket, user: @teacher2)

    #this user's exit ticket
    sign_in @teacher
    create(:aidiff_exit_ticket, user: @teacher, title: "title 1")
    create(:aidiff_exit_ticket, user: @teacher, title: "title 2")

    get :index

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 2, json_response.count
    assert_equal "title 1", json_response[0]["title"]
    assert_equal "title 2", json_response[1]["title"]
  end

  test "create makes artifact AND associations" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    message1 = create(:aidiff_message, aidiff_thread: thread1, content: '{"blah": "lol"}', is_artifact_candidate: true, artifact_candidate_type: SharedConstants::AI_DIFF_ARTIFACT_TYPE[:EXIT_TICKET])

    section1 = create(:section, user: @teacher)
    section2 = create(:section, user: @teacher)

    post :create,
      params: {
        messageId: message1.id,
        unitId: @unit_in_course.id,
        lessonId: @lesson.id,
        sectionIds: [section1.id, section2.id]
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "AidiffExitTicket", json_response["type"]
    expected = {
      'blah' => 'lol'
    }
    assert_equal expected, json_response["content"]

    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 2, artifact.aidiff_artifact_associations.count

    association = artifact.aidiff_artifact_associations.first
    assert_equal @unit_in_course.id, association.unit_id
    assert_equal @lesson.id, association.lesson_id
    assert_equal section1.id, association.section_id
    assert_equal SharedConstants::AI_DIFF_ASSOCIATION[:LESSON], association.association_type
  end
end
