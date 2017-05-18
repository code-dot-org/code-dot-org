require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    sign_in @teacher

    @levelbuilder = create :user
    UserPermission.create(user_id: @levelbuilder.id, permission: 'levelbuilder')

    plc_course = create :plc_course, name: 'My Plc'
    @course_plc = plc_course.course
    @course_regular = create :course, name: 'non-plc-course'

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)
  end

  # Tests for show

  test "show: plc courses get sent to user_course_enrollments_controller" do
    get :show, params: {course_name: @course_plc.name}
    assert_template 'plc/user_course_enrollments/index'
  end

  test "show: plc course names get titleized" do
    get :show, params: {course_name: 'my_plc'}
    assert_template 'plc/user_course_enrollments/index'
  end

  test "show: regular courses get sent to show" do
    get :show, params: {course_name: @course_regular.name}
    assert_template 'courses/show'
  end

  test "show: regular courses do not get titlized" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'non_plc_course'}
    end
  end

  test "show: non existant course throws" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'nosuchcourse'}
    end
  end

  # Tests for create

  test "create: fails without levelbuilder permission" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'csp'}}
    assert_response 403
  end

  test "create: succeeds with levelbuilder permission" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'csp'}}
    Course.find_by_name!('csp')
    assert_redirected_to '/courses/csp/edit'
  end

  test "create: failure to save redirects to new" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'CSP'}}
    assert_template 'courses/new'
  end

  # tests for update

  test "update: fails without levelbuilder permission" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'

    post :update, params: {course_name: 'csp', scripts: ['script1', 'script2']}
    assert_response 403
  end

  test "update: persists changes to course_scripts" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'

    post :update, params: {course_name: 'csp', scripts: ['script1', 'script2']}
    assert_equal 2, Course.find_by_name('csp').course_scripts.length

    assert_redirected_to '/courses/csp'
  end

  test "update: persists changes localizeable strings" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'

    post :update, params: {course_name: 'csp', scripts: [], title: 'Computer Science Principles'}
    assert_equal 'Computer Science Principles', Course.find_by_name!('csp').summarize[:title]
  end

  # tests for edit

  test "edit: does not work for plc_course" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :plc_course, name: 'plc-course'

    assert_raises ActiveRecord::ReadOnlyRecord do
      get :edit, params: {course_name: 'plc-course'}
    end
  end

  test "edit: renders edit page for regular courses" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'

    get :edit, params: {course_name: 'csp'}
    assert_template 'courses/edit'
  end
end
