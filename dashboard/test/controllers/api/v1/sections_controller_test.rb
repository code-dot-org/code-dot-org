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

    course_id = json.find {|section| section['id'] == @section_with_course.id}['courseId']
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

    assert_equal @course.id, json['courseId']
  end

  test 'logged out cannot create a section' do
    post :create
    assert_response :forbidden
  end

  test 'student cannot create a section' do
    sign_in @word_user_1
    post :create
    assert_response :forbidden
  end

  test 'teacher can create a section' do
    sign_in @teacher
    post :create
    assert_response :success
    created_section = JSON.parse(@response.body).with_indifferent_access
    refute_nil created_section[:id]
    assert_equal(
      {
        id: created_section[:id],
        name: "New Section",
        teacherName: @teacher.name,
        linkToProgress: "//test.code.org/teacher-dashboard#/sections/#{created_section[:id]}/progress",
        assignedTitle: "",
        linkToAssigned: "//test.code.org/teacher-dashboard#/sections/",
        numberOfStudents: 0,
        linkToStudents: "//test.code.org/teacher-dashboard#/sections/#{created_section[:id]}/manage",
        code: created_section[:code],
        stage_extras: false,
        pairing_allowed: true,
        login_type: "",
        course_id:  nil,
        script: {'id': nil, 'name': nil},
        studentNames: [],
      }.with_indifferent_access,
      created_section
    )
  end
end
