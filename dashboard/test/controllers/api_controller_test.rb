require 'test_helper'

class ApiControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher = create(:teacher)
    sign_in @teacher

    @section = create(:section, user: @teacher, login_type: 'word')
    @student_1 = create(:follower, section: @section).student_user
    @student_2 = create(:follower, section: @section).student_user

    @flappy_section = create(:section, user: @teacher, script_id: Script::FLAPPY_ID)
    @student_3 = create(:follower, section: @flappy_section).student_user
    @student_3.backfill_user_scripts
  end

  test "should get progress for section with default script" do
    get :section_progress, id: @section.id
    assert_response :success
    
    assert_equal Script.twenty_hour_script, assigns(:script)
  end


  test "should get progress for section with section script" do
    get :section_progress, id: @flappy_section.id
    assert_response :success
    
    assert_equal Script.find(Script::FLAPPY_ID), assigns(:script)
  end

  test "should get progress for student" do
    get :student_progress, id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section" do
    get :student_progress, id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section with section script" do
    get :student_progress, id: @student_3.id, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.find(Script::FLAPPY_ID), assigns(:script)
  end

  test "should get user_hero for teacher" do
    sign_in @teacher
    get :user_hero
    
    assert_select '#welcome'
    assert_select '#classroom'
  end

  test "should get user_hero for student with script" do
    sign_in @student_3
    get :user_hero

    assert_select '#welcome'
    assert_select '#student_progress'
  end

  test 'api routing' do
    assert_routing({method: "get", path: "/api/user_menu"},
                   {controller: "api", action: "user_menu"})

    assert_routing({method: "get", path: "/api/section_progress/2"},
                   {controller: "api", action: "section_progress", id: '2'})

    assert_routing({method: "get", path: "/api/student_progress/2/15"},
                   {controller: "api", action: "student_progress", section_id: '2', id: '15'})

    assert_routing({method: "get", path: "/api/whatevvv"},
                   {controller: "api", action: "whatevvv"})
  end
end
