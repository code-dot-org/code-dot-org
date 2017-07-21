require 'test_helper'

class Api::V1::SectionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_user_1 = create(:follower, section: @picture_section).student_user

    @regular_section = create(:section, user: @teacher, login_type: 'email')

    @flappy_section = create(:section, user: @teacher, login_type: 'word', script_id: Script.get_from_cache(Script::FLAPPY_NAME).id)
    @flappy_user_1 = create(:follower, section: @flappy_section).student_user
  end

  setup do
    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @course = create(:course)
    @section_with_course = create(:section, user: @teacher, login_type: 'word', course_id: @course.id)
    @section_with_course_user_1 = create(:follower, section: @section_with_course).student_user
  end

  test 'returns all sections belonging to teacher' do
    sign_in @teacher

    get :index
    assert_response :success
    json = JSON.parse(@response.body)

    expected = @teacher.sections.map {|section| section.summarize.with_indifferent_access}
    assert_equal expected, json
  end

  test 'students own zero sections' do
    sign_in @word_user_1

    get :index
    assert_response :success
    assert_equal '[]', @response.body
  end

  test 'logged out cannot list sections' do
    get :index
    assert_response :forbidden
  end

  test 'specifies course_id for sections that have one assigned' do
    sign_in @teacher

    get :index
    assert_response :success
    json = JSON.parse(@response.body)

    course_id = json.find {|section| section['id'] == @section_with_course.id}['course_id']
    assert_equal @course.id, course_id
  end

  test 'logged out cannot view section detail' do
    get :show, params: {id: @word_section.id}
    assert_response :forbidden
  end

  test 'student cannot view section detail' do
    sign_in @word_user_1
    get :show, params: {id: @word_section.id}
    assert_response :forbidden
  end

  test "teacher cannot view another teacher's section detail" do
    sign_in create :teacher
    get :show, params: {id: @word_section.id}
    assert_response :forbidden
  end

  test 'summarizes section details' do
    sign_in @teacher

    get :show, params: {id: @picture_section.id}
    assert_response :success
    assert_equal @picture_section.summarize.to_json, @response.body
  end

  test 'specifies course_id' do
    sign_in @teacher

    get :show, params: {id: @section_with_course.id}
    assert_response :success
    json = JSON.parse(@response.body)

    assert_equal @course.id, json['course_id']
  end

  test "join with invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      post :join, params: {id: 'xxxxxx'}
    end
  end

  test "join with nobody signed in" do
    post :join, params: {id: @word_section.code}
    assert_response 404
  end

  test "join with valid section code" do
    student = create :student
    sign_in student
    post :join, params: {id: @word_section.code}
    assert_response :success
  end

  test "leave with invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      post :leave, params: {id: 'xxxxxx'}
    end
  end

  test "leave with nobody signed in" do
    post :leave, params: {id: @word_section.code}
    assert_response 404
  end

  test "leave with valid section code" do
    sign_in @word_user_1
    post :leave, params: {id: @word_section.code}
    assert_response :success
  end
end
