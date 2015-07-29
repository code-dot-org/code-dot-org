require 'test_helper'

class ApiControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher = create(:teacher)
    sign_in @teacher

    @section = create(:section, user: @teacher, login_type: 'word')
    @student_1 = create(:follower, section: @section).student_user
    @student_2 = create(:follower, section: @section).student_user

    @flappy_section = create(:section, user: @teacher, script_id: Script.get_from_cache(Script::FLAPPY_NAME).id)
    @student_3 = create(:follower, section: @flappy_section).student_user
    @student_4 = create(:follower, section: @flappy_section).student_user
    @student_3.backfill_user_scripts
  end

  test "should get progress for section with default script" do
    get :section_progress, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for section with section script" do
    get :section_progress, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for section with specific script" do
    script = Script.find_by_name('algebra')

    get :section_progress, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get progress for section with section script when blank script is specified" do
    get :section_progress, section_id: @flappy_section.id, script_id: ''
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for student" do
    get :student_progress, student_id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section" do
    get :student_progress, student_id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section with section script" do
    get :student_progress, student_id: @student_3.id, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for student in section with specified script" do
    script = Script.find_by_name('algebra')
    get :student_progress, student_id: @student_3.id, section_id: @flappy_section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get user_hero for teacher" do
    sign_in @teacher
    get :user_hero

    assert_select '#welcome.teacher'
    assert_select '.teacherdashboard'
  end

  test "should get user_hero for student with script" do
    sign_in @student_3
    get :user_hero

    assert_select '#welcome.student'
    assert_select '#currentprogress'
  end

  test "should get user_hero for student with no script" do
    sign_in @student_1
    get :user_hero

    assert_select '#welcome.student'
    assert_select  '#suggestcourse', I18n.t('home.no_primary_course')
  end

  test 'api routing' do
    # /dashboardapi urls
    assert_routing({method: "get", path: "/dashboardapi/user_menu"},
                   {controller: "api", action: "user_menu"})

    assert_routing({method: "get", path: "/dashboardapi/section_progress/2"},
                   {controller: "api", action: "section_progress", section_id: '2'})

    assert_routing({method: "get", path: "/dashboardapi/student_progress/2/15"},
                   {controller: "api", action: "student_progress", section_id: '2', student_id: '15'})

    assert_routing({method: "get", path: "/dashboardapi/whatevvv"},
                   {controller: "api", action: "whatevvv"})

    # /api urls
    assert_recognizes({controller: "api", action: "user_menu"},
                      {method: "get", path: "/api/user_menu"})


    assert_recognizes({controller: "api", action: "section_progress", section_id: '2'},
                      {method: "get", path: "/api/section_progress/2"})


    assert_recognizes({controller: "api", action: "student_progress", section_id: '2', student_id: '15'},
                      {method: "get", path: "/api/student_progress/2/15"})


    assert_recognizes({controller: "api", action: "whatevvv"},
                      {method: "get", path: "/api/whatevvv"})

  end
end
