require 'test_helper'

class CongratsControllerTest < ActionController::TestCase
  test "shows congrats page for HoC course" do
    hoc_unit = create(:hoc_script)
    get :index, params: {s: Base64.urlsafe_encode64(hoc_unit.name)}
    assert_response :success

    assert assigns(:is_hoc_tutorial)
    refute assigns(:is_pl_course)

    certificate_data = assigns(:certificate_data)
    assert_equal 1, certificate_data.length
    assert_equal hoc_unit.name, certificate_data[0][:courseName]
  end

  test "cached query test for hoc course" do
    hoc_unit = create(:hoc_script)

    Unit.stubs(:should_cache?).returns(true)

    assert_cached_queries(0) do
      get :index, params: {s: Base64.urlsafe_encode64(hoc_unit.name)}
      assert_response :success
    end
  end

  test "shows congrats page for unknown course" do
    get :index, params: {s: Base64.urlsafe_encode64('2p-activity')}
    assert_response :success

    assert assigns(:is_hoc_tutorial)
    refute assigns(:is_pl_course)

    certificate_data = assigns(:certificate_data)
    assert_equal 1, certificate_data.length
    assert_equal '2p-activity', certificate_data[0][:courseName]
  end

  test "shows congrats page for PL unit with completion" do
    teacher = create :teacher
    sign_in teacher

    pl_unit = create(:pl_unit, :is_course)
    CourseOffering.add_course_offering(pl_unit)
    create :user_script, user: teacher, script: pl_unit, completed_at: Time.now

    get :index, params: {s: Base64.urlsafe_encode64(pl_unit.name)}
    assert_response :success

    refute assigns(:is_hoc_tutorial)
    assert assigns(:is_pl_course)

    certificate_data = assigns(:certificate_data)
    assert_equal 1, certificate_data.length
    assert_equal pl_unit.name, certificate_data[0][:courseName]
  end

  test "no certificate for PL unit without completion" do
    teacher = create :teacher
    sign_in teacher

    pl_unit = create(:pl_unit, :is_course)
    CourseOffering.add_course_offering(pl_unit)
    assert_nil UserScript.find_by(user: teacher, script: pl_unit)

    get :index, params: {s: Base64.urlsafe_encode64(pl_unit.name)}
    assert_response :success

    refute assigns(:is_hoc_tutorial)
    assert assigns(:is_pl_course)

    certificate_data = assigns(:certificate_data)
    assert_equal 0, certificate_data.length
  end

  test "shows multiple certificates for unit group with partial completion" do
    student = create :student
    sign_in student

    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root

    unit1 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
    unit2 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
    unit3 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit3, position: 3

    create :user_script, user: student, script: unit1, completed_at: Time.now
    create :user_script, user: student, script: unit2, completed_at: Time.now
    assert_nil UserScript.find_by(user: student, script: unit3)

    get :index, params: {s: Base64.urlsafe_encode64(unit_group.name)}
    assert_response :success

    certificate_data = assigns(:certificate_data)
    assert_equal 2, certificate_data.length
    assert_equal unit1.name, certificate_data[0][:courseName]
    assert_equal unit2.name, certificate_data[1][:courseName]
  end

  test "shows one certificate for fully completed unit group" do
    student = create :student
    sign_in student

    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root

    unit1 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
    unit2 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
    unit3 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit3, position: 3

    create :user_script, user: student, script: unit1, completed_at: Time.now
    create :user_script, user: student, script: unit2, completed_at: Time.now
    create :user_script, user: student, script: unit3, completed_at: Time.now

    get :index, params: {s: Base64.urlsafe_encode64(unit_group.name)}
    assert_response :success

    certificate_data = assigns(:certificate_data)
    assert_equal 1, certificate_data.length
    assert_equal unit_group.name, certificate_data[0][:courseName]
  end
end
