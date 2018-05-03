require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    sign_in @teacher

    @levelbuilder = create :levelbuilder

    Script.stubs(:should_cache?).returns true
    plc_course = create :plc_course, name: 'My Plc'
    @course_plc = plc_course.course
    @course_regular = create :course, name: 'non-plc-course'

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)
  end

  # Tests for index

  test_user_gets_response_for :index, response: :success, user: :teacher, queries: 26

  test_user_gets_response_for :index, response: :success, user: :admin, queries: 26

  test_user_gets_response_for :index, response: :success, user: :user, queries: 25

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

  test_user_gets_response_for :show, response: :success, user: :teacher, params: -> {{course_name: @course_regular.name}}, queries: 9

  test_user_gets_response_for :show, response: :forbidden, user: :admin, params: -> {{course_name: @course_regular.name}}, queries: 3

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

  test "update: persists changes to default_course_scripts" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'

    post :update, params: {course_name: 'csp', scripts: ['script1', 'script2']}
    default_course_scripts = Course.find_by_name('csp').default_course_scripts
    assert_equal 2, default_course_scripts.length
    assert_equal ['script1', 'script2'], default_course_scripts.map(&:script).map(&:name)

    assert_redirected_to '/courses/csp'
  end

  test "update: persists changes to alternate_course_scripts" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :course, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'
    create :script, name: 'script2-alt'
    create :script, name: 'script3'

    post :update, params: {
      course_name: 'csp',
      scripts: ['script1', 'script2', 'script3'],
      alternate_scripts: [
        {
          experiment_name: 'my_experiment',
          alternate_script: 'script2-alt',
          default_script: 'script2'
        }
      ]
    }
    course = Course.find_by_name('csp')
    assert_equal 3, course.default_course_scripts.length
    assert_equal ['script1', 'script2', 'script3'], course.default_course_scripts.map(&:script).map(&:name)

    assert_equal 1, course.alternate_course_scripts.length
    alternate_course_script = course.alternate_course_scripts.first
    assert_equal 'script2-alt', alternate_course_script.script.name
    assert_equal 'script2', alternate_course_script.default_script.name
    assert_equal 'my_experiment', alternate_course_script.experiment_name

    default_script = Script.find_by(name: 'script2')
    expected_position = course.default_course_scripts.find_by(script: default_script).position
    assert_equal expected_position, alternate_course_script.position,
      'an alternate script must have the same position as the default script it replaces'

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
