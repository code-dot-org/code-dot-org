require 'test_helper'

class Api::V1::AssessmentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @teacher.permission = UserPermission::AUTHORIZED_TEACHER
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  # index tests - gets assessment questions and answers
  test 'logged out cannot get assessment questions and answers' do
    get :index
    assert_response :forbidden
  end

  test 'students cannot get assessment questions and answers' do
    sign_in @student
    get :index
    assert_response :forbidden
  end

  test 'non-verified teacher cannot get assessment questions and answers' do
    non_verified_teacher = create(:teacher)
    section = create(:section, user: non_verified_teacher, login_type: 'word')
    create(:follower, section: section).student_user

    sign_in non_verified_teacher
    get :index
    assert_response :not_found
  end

  test 'verified teacher can get assessment questions and answers' do
    sign_in @teacher
    get :index, params: {section_id: @section.id, script_id: 2}
    assert_response :success
    assert_equal '{}', @response.body
  end

  # section_responses tests - gets student responses to assessment
  test 'logged out cannot get assessment responses from students' do
    get :section_responses
    assert_response :forbidden
  end

  test 'students cannot get assessment responses from students' do
    sign_in @student
    get :section_responses
    assert_response :forbidden
  end

  test 'verified teacher can get assessment responses from students' do
    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: 2}
    assert_response :success
    assert_equal '{}', @response.body
  end

  test "should get assessments responses for section with script with level_group assessment" do
    # Sign in and create a new script.
    sign_in @teacher
    script = create :script

    # Set up an assessment for that script.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # Student has completed an assessment.
    level_source = create(
      :level_source,
      level: level1,
      data: %Q({"#{sub_level1.id}":{"result":"This is a free response"},"#{sub_level2.id}":{"result":"0"},"#{sub_level3.id}":{"result":"1"},"#{sub_level4.id}":{"result":"-1"}})
    )
    create :activity, user: @student, level: level1,
      level_source: level_source

    updated_at = Time.now

    create :user_level, user: @student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at, level_source: level_source

    # Call the controller method.
    get :section_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }

    assert_response :success

    # All these are translation missing because we don't actually generate i18n files in tests.
    expected_response = {
      @student.id.to_s => {
        "student_name" => @student.name,
        "responses_by_assessment" => {
          level1.id.to_s => {
            "stage" => "translation missing: en-US.data.script.name.#{script.name}.title",
            "puzzle" => 1,
            "question" => "Long assessment 1",
            "url" => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student.id}",
            "multi_correct" => 1,
            "multi_count" => 4,
            "submitted" => true,
            "timestamp" => updated_at.utc.to_s,
            "level_results" => [
              {"student_result" => "This is a free response", "status" => "free_response"},
              {"student_result" => "A", "status" => "correct"},
              {"student_result" => "B", "status" => "incorrect"},
              {"student_result" => "", "status" => "unsubmitted"},
              {"status" => "unsubmitted"}
            ]
          }
        }
      }
    }
    assert_equal expected_response, JSON.parse(@response.body)
  end
end
