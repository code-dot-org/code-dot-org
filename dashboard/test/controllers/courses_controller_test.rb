require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    sign_in @teacher

    @levelbuilder = create :levelbuilder

    Script.stubs(:should_cache?).returns true
    @course_regular = create :course, name: 'non-plc-course'

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)
  end

  # Tests for index

  test_user_gets_response_for :index, response: :success, user: :teacher, queries: 4

  test_user_gets_response_for :index, response: :success, user: :admin, queries: 4

  test_user_gets_response_for :index, response: :success, user: :user, queries: 3

  # Tests for show

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

  test_user_gets_response_for :show, response: :success, user: :teacher, params: -> {{course_name: @course_regular.name}}, queries: 8

  test_user_gets_response_for :show, response: :forbidden, user: :admin, params: -> {{course_name: @course_regular.name}}, queries: 2

  # For now, this test passes due to hard-coded logic in CoursesController#show.
  # This test ensures that hard-coded logic is not removed without being replaced
  # by the appropriate db-driven redirection logic.
  test "show: redirect to latest stable version in course family" do
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018'
    create :course, name: 'csp-2019', family_name: 'csp', version_year: '2019'
    get :show, params: {course_name: 'csp'}
    assert_redirected_to '/courses/csp-2019'

    create :course, name: 'csd-2018', family_name: 'csd', version_year: '2018'
    create :course, name: 'csd-2019', family_name: 'csd', version_year: '2019'
    get :show, params: {course_name: 'csd'}
    assert_redirected_to '/courses/csd-2019'
  end

  test "show: redirect to latest stable version in course family for logged out user" do
    sign_out @teacher
    create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017', is_stable: true
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018', is_stable: true
    create :course, name: 'csp-2019', family_name: 'csp', version_year: '2019'

    get :show, params: {course_name: 'csp-2017'}

    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect to latest stable version if no_redirect query param provided" do
    sign_out @teacher
    create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017', is_stable: true
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018', is_stable: true

    get :show, params: {course_name: 'csp-2017', no_redirect: "true"}
    assert_response :ok
    get :show, params: {course_name: 'csp-2017'}
    assert_response :ok
  end

  test "show: redirect to latest stable version in course family for student" do
    create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017', is_stable: true
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018', is_stable: true
    create :course, name: 'csp-2019', family_name: 'csp', version_year: '2019'

    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}

    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect student to latest stable version in course family if they have progress" do
    create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017'
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018'

    Course.any_instance.stubs(:has_progress?).returns(true)
    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect student to latest stable version in course family if they are assigned" do
    student = create :student
    csp2017 = create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017'
    create :follower, section: create(:section, course: csp2017), student_user: student
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018'

    sign_in student
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in course family" do
    create :course, name: 'csp-2017', family_name: 'csp', version_year: '2017'
    create :course, name: 'csp-2018', family_name: 'csp', version_year: '2018'

    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
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
    create :course, name: 'csp-2017'

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles'}
    assert_equal "Computer Science Principles ('17-'18)", Course.find_by_name!('csp-2017').summarize[:title]
  end

  test "update: persists changes to course_params" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    course = create :course, name: 'csp-2019'

    assert_nil course.version_year
    assert_nil course.family_name
    refute course.has_verified_resources

    post :update, params: {
      course_name: course.name,
      version_year: '2019',
      family_name: 'csp',
      has_verified_resources: 'on'
    }
    course.reload

    assert_equal '2019', course.version_year
    assert_equal 'csp', course.family_name
    assert course.has_verified_resources
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
