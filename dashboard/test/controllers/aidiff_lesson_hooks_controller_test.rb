require 'test_helper'

class AidiffLessonHooksControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @unit_group = create(:unit_group, family_name: 'beepboop')
    @course_offering = create(:course_offering, display_name: 'Course Name')
    @course_version = create(:course_version, content_root: @unit_group, course_offering: @course_offering)
    @unit_in_course = create(:script)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @lesson_group = create(:lesson_group, script: @unit_in_course)
    @lesson = create(:lesson, script: @unit_in_course, lesson_group: @lesson_group)

    @teacher_sans_experiment = create(:teacher)
    @teacher = create(:teacher)

    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher_sans_experiment.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-artifact')
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

  test "index returns only user-owned exit_tickets" do
    #some other user's thread
    @teacher2 = create(:teacher)
    create(:single_user_experiment, min_user_id: @teacher2.id, name: 'ai-differentiation')
    thread1 = create(:aidiff_thread, user: @teacher2, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: @lesson.id, context_type: "lesson")
    thread2 = create(:aidiff_thread, user: @teacher2, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: @lesson.id, context_type: "lesson")

    create(:aidiff_lesson_hook, aidiff_thread: thread1, user: @teacher2)
    create(:aidiff_exit_ticket, aidiff_thread: thread2, user: @teacher2)

    #this user's threads
    sign_in @teacher
    thread3 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    thread4 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")

    create(:aidiff_lesson_hook, aidiff_thread: thread3, user: @teacher)
    create(:aidiff_exit_ticket, aidiff_thread: thread4, user: @teacher)

    get :index

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.count
    assert_equal "AidiffLessonHook", json_response[0]["type"]
  end

  test "index returns only exit_tickets" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    thread2 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")
    thread3 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")

    create(:aidiff_lesson_hook, aidiff_thread: thread1, user: @teacher)
    create(:aidiff_exit_ticket, aidiff_thread: thread2, user: @teacher)
    create(:aidiff_lesson_hook, aidiff_thread: thread3, user: @teacher)

    get :index

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 2, json_response.count
    assert_equal "AidiffLessonHook", json_response[0]["type"]
    assert_equal "AidiffLessonHook", json_response[1]["type"]
  end

  test "index returns only exit_tickets matching unit_group params" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    thread2 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")
    thread3 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")

    artifact1 = create(:aidiff_lesson_hook, aidiff_thread: thread1, user: @teacher, title: "blah artifact")
    create(:aidiff_exit_ticket, aidiff_thread: thread2, user: @teacher)
    artifact3 = create(:aidiff_lesson_hook, aidiff_thread: thread3, user: @teacher, title: "lol artifact")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group2 = create(:unit_group, family_name: 'lol')

    create(:aidiff_artifact_association, aidiff_artifact: artifact1, association_type: "course", unit_group: unit_group1)
    create(:aidiff_artifact_association, aidiff_artifact: artifact3, association_type: "course", unit_group: unit_group2)

    get :index, params: {unit_group_ids: [unit_group1.id, 5]}

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.count
    assert_equal "AidiffLessonHook", json_response[0]["type"]
    assert_equal "blah artifact", json_response[0]["title"]
  end

  test "index returns only unique exit_tickets matching params" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    thread2 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")
    thread3 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")

    artifact1 = create(:aidiff_lesson_hook, aidiff_thread: thread1, user: @teacher, title: "blah artifact")
    create(:aidiff_lesson_hook, aidiff_thread: thread2, user: @teacher, title: "omg artifact")
    artifact3 = create(:aidiff_lesson_hook, aidiff_thread: thread3, user: @teacher, title: "lol artifact")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group2 = create(:unit_group, family_name: 'lol')
    unit_group3 = create(:unit_group, family_name: 'more')

    create(:aidiff_artifact_association, aidiff_artifact: artifact1, association_type: "course", unit_group: unit_group1)
    create(:aidiff_artifact_association, aidiff_artifact: artifact1, association_type: "course", unit_group: unit_group3)
    create(:aidiff_artifact_association, aidiff_artifact: artifact3, association_type: "course", unit_group: unit_group2)

    get :index, params: {unit_group_ids: [unit_group1.id, unit_group3.id]}

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 1, json_response.count
    assert_equal "AidiffLessonHook", json_response[0]["type"]
    assert_equal "blah artifact", json_response[0]["title"]
  end

  test "index returns only unique exit_tickets matching multiple params" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")
    thread2 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")
    thread3 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: @unit_in_course.id, lesson_id: nil, context_type: "unit")

    artifact1 = create(:aidiff_lesson_hook, aidiff_thread: thread1, user: @teacher, title: "blah artifact")
    artifact2 = create(:aidiff_lesson_hook, aidiff_thread: thread2, user: @teacher, title: "omg artifact")
    create(:aidiff_lesson_hook, aidiff_thread: thread3, user: @teacher, title: "lol artifact")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group3 = create(:unit_group, family_name: 'more')
    section1 = create(:section, user: @teacher)

    create(:aidiff_artifact_association, aidiff_artifact: artifact1, association_type: "course", unit_group: unit_group1)
    create(:aidiff_artifact_association, aidiff_artifact: artifact1, association_type: "course", unit_group: unit_group3)
    create(:aidiff_artifact_association, aidiff_artifact: artifact2, association_type: "section", section: section1)

    get :index, params: {unit_group_ids: [unit_group1.id, unit_group3.id], section_ids: [section1.id]}

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 2, json_response.count
    assert_equal "AidiffLessonHook", json_response[0]["type"]
    assert_equal "blah artifact", json_response[0]["title"]
    assert_equal "AidiffLessonHook", json_response[1]["type"]
    assert_equal "omg artifact", json_response[1]["title"]
  end

  test "create makes artifact AND associations" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group3 = create(:unit_group, family_name: 'more')
    section1 = create(:section, user: @teacher)

    post :create,
      params: {
        aidiff_artifact_associations_attributes: [
          {association_type: "course", unit_group_id: unit_group1.id},
          {association_type: "course", unit_group_id: unit_group3.id},
          {association_type: "section", section_id: section1.id}
        ],
        title: "wow a title",
        content: {blah: "lol"},
        aidiff_thread_id: thread1.id,
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "AidiffLessonHook", json_response["type"]
    assert_equal "wow a title", json_response["title"]
    assert_equal ({"blah" => "lol"}), json_response["content"]

    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 3, artifact.aidiff_artifact_associations.count
  end

  test "update title and content" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group3 = create(:unit_group, family_name: 'more')
    section1 = create(:section, user: @teacher)

    post :create,
      params: {
        aidiff_artifact_associations_attributes: [
          {association_type: "course", unit_group_id: unit_group1.id},
          {association_type: "course", unit_group_id: unit_group3.id},
          {association_type: "section", section_id: section1.id}
        ],
        title: "wow a title",
        content: {blah: "lol"},
        aidiff_thread_id: thread1.id,
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "AidiffLessonHook", json_response["type"]
    assert_equal "wow a title", json_response["title"]
    assert_equal ({"blah" => "lol"}), json_response["content"]

    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 3, artifact.aidiff_artifact_associations.count

    put :update,
      params: {
        id: json_response["id"],
        title: "new title",
        content: {new: "content"}
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "new title", json_response["title"]
    assert_equal ({"new" => "content"}), json_response["content"]
  end

  test "update to add association" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group3 = create(:unit_group, family_name: 'more')
    section1 = create(:section, user: @teacher)

    post :create,
      params: {
        aidiff_artifact_associations_attributes: [
          {association_type: "course", unit_group_id: unit_group1.id},
          {association_type: "course", unit_group_id: unit_group3.id},
          {association_type: "section", section_id: section1.id}
        ],
        title: "wow a title",
        content: {blah: "lol"},
        aidiff_thread_id: thread1.id,
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "AidiffLessonHook", json_response["type"]
    assert_equal "wow a title", json_response["title"]
    assert_equal ({"blah" => "lol"}), json_response["content"]

    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 3, artifact.aidiff_artifact_associations.count

    lesson1 = create(:lesson)

    put :update,
      params: {
        id: json_response["id"],
        aidiff_artifact_associations_attributes: [
          {association_type: "lesson", unit_group_id: lesson1.id},
        ]
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 4, artifact.aidiff_artifact_associations.count
    assert_equal "lesson", artifact.aidiff_artifact_associations.last["association_type"]
  end

  test "update to destroy association" do
    sign_in @teacher
    thread1 = create(:aidiff_thread, user: @teacher, llm_version: AiDiffBedrockHelper::MODEL_ID, course_id: @unit_group.id, unit_id: nil, lesson_id: nil, context_type: "course")

    unit_group1 = create(:unit_group, family_name: 'blah')
    unit_group3 = create(:unit_group, family_name: 'more')
    section1 = create(:section, user: @teacher)

    post :create,
      params: {
        aidiff_artifact_associations_attributes: [
          {association_type: "course", unit_group_id: unit_group1.id},
          {association_type: "course", unit_group_id: unit_group3.id},
          {association_type: "section", section_id: section1.id}
        ],
        title: "wow a title",
        content: {blah: "lol"},
        aidiff_thread_id: thread1.id,
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal "AidiffLessonHook", json_response["type"]
    assert_equal "wow a title", json_response["title"]
    assert_equal ({"blah" => "lol"}), json_response["content"]

    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 3, artifact.aidiff_artifact_associations.count

    put :update,
      params: {
        id: json_response["id"],
        aidiff_artifact_associations_attributes: [
          {id: artifact.aidiff_artifact_associations.first.id, _destroy: 1},
        ]
      }

    assert_response :success
    json_response = JSON.parse(response.body)
    artifact = AidiffArtifact.find_by_id(json_response["id"])
    assert_equal 2, artifact.aidiff_artifact_associations.count
  end
end
