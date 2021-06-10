require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @teacher = create :teacher
    sign_in @teacher

    @levelbuilder = create :levelbuilder

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit_group = create :unit_group, pilot_experiment: 'my-experiment'
    @pilot_section = create :section, user: @pilot_teacher, unit_group: @pilot_unit_group
    @pilot_student = create(:follower, section: @pilot_section).student_user

    Script.stubs(:should_cache?).returns true
    Script.clear_cache

    @unit_group_regular = create :unit_group, name: 'non-plc-course'

    @migrated_script = create :script, is_migrated: true
    @unit_group_migrated = create :unit_group
    create :unit_group_unit, unit_group: @unit_group_migrated, script: @migrated_script, position: 1

    @unmigrated_script = create :script
    @unit_group_unmigrated = create :unit_group
    create :unit_group_unit, unit_group: @unit_group_unmigrated, script: @unmigrated_script, position: 1

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)
  end

  teardown do
    Script.clear_cache
  end

  # Tests for index

  test_user_gets_response_for :index, response: :success, user: :teacher, queries: 4

  test_user_gets_response_for :index, response: :success, user: :admin, queries: 4

  test_user_gets_response_for :index, response: :success, user: :user, queries: 4

  # Tests for show

  test "show: regular courses get sent to show" do
    get :show, params: {course_name: @unit_group_regular.name}
    assert_template 'courses/show'
  end

  test "show: non existant course throws" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'nosuchcourse'}
    end
  end

  test_user_gets_response_for :show, response: :success, user: :teacher, params: -> {{course_name: @unit_group_regular.name}}, queries: 8

  test_user_gets_response_for :show, response: :forbidden, user: :admin, params: -> {{course_name: @unit_group_regular.name}}, queries: 2

  test "show: redirect to latest stable version in course family" do
    Rails.cache.delete("valid_courses/all") # requery the db after adding the unit_groups below
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2020'
    get :show, params: {course_name: 'csp'}
    assert_redirected_to '/courses/csp-2019'

    Rails.cache.delete("valid_courses/all") # requery the db after adding the unit_groups below
    create :unit_group, name: 'csd-2018', family_name: 'csd', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csd-2019', family_name: 'csd', version_year: '2019', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csd-2020', family_name: 'csd', version_year: '2019'
    get :show, params: {course_name: 'csd'}
    assert_redirected_to '/courses/csd-2019'
  end

  test "show: redirect from new unstable version to assigned version" do
    student = create :student
    csp2017 = create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :follower, section: create(:section, unit_group: csp2017), student_user: student
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019'

    sign_in student
    get :show, params: {course_name: 'csp-2019'}

    assert_redirected_to '/courses/csp-2017/?redirect_warning=true'
  end

  test "show: redirect to latest stable version in course family for logged out user" do
    sign_out @teacher
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019'

    get :show, params: {course_name: 'csp-2017'}

    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect to latest stable version if no_redirect query param provided" do
    sign_out @teacher
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable

    get :show, params: {course_name: 'csp-2017', no_redirect: "true"}
    assert_response :ok
    get :show, params: {course_name: 'csp-2017'}
    assert_response :ok
  end

  test "show: redirect to latest stable version in course family for student" do
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019'

    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}
    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'

    get :show, params: {course_name: 'csp-2019'}
    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect student to latest stable version in course family if they have progress" do
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017'
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018'

    UnitGroup.any_instance.stubs(:has_progress?).returns(true)
    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect student to latest stable version in course family if they are assigned" do
    student = create :student
    csp2017 = create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017'
    create :follower, section: create(:section, unit_group: csp2017), student_user: student
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018'

    sign_in student
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in course family" do
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable

    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  no_access_msg = "You don&#39;t have access to this course."

  test_user_gets_response_for :show, response: :redirect, user: nil,
                              params: -> {{course_name: @pilot_unit_group.name}},
                              name: 'signed out user cannot view pilot script'

  test_user_gets_response_for(:show, response: :success, user: :student,
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'student cannot view pilot course'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
                              params: -> {{course_name: @pilot_unit_group.name}},
                              name: 'teacher without pilot access cannot view pilot course'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_teacher},
                              params: -> {{course_name: @pilot_unit_group.name, section_id: @pilot_section.id}},
                              name: 'pilot teacher can view pilot course'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_student},
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'pilot student can view pilot course'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'levelbuilder can view pilot course'
  ) do
    refute response.body.include? no_access_msg
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
    UnitGroup.find_by_name!('csp')
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
    create :unit_group, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'

    post :update, params: {course_name: 'csp', scripts: ['script1', 'script2']}
    assert_response 403
  end

  test "update: persists changes to default_unit_group_units" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'
    create :script, name: 'script1'
    create :script, name: 'script2'

    post :update, params: {course_name: 'csp', scripts: ['script1', 'script2']}
    default_unit_group_units = UnitGroup.find_by_name('csp').default_unit_group_units
    assert_equal 2, default_unit_group_units.length
    assert_equal ['script1', 'script2'], default_unit_group_units.map(&:script).map(&:name)

    assert_response :success
  end

  test "update: persists changes to alternate_unit_group_units" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'
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
    unit_group = UnitGroup.find_by_name('csp')
    assert_equal 3, unit_group.default_unit_group_units.length
    assert_equal ['script1', 'script2', 'script3'], unit_group.default_unit_group_units.map(&:script).map(&:name)

    assert_equal 1, unit_group.alternate_unit_group_units.length
    alternate_unit_group_unit = unit_group.alternate_unit_group_units.first
    assert_equal 'script2-alt', alternate_unit_group_unit.script.name
    assert_equal 'script2', alternate_unit_group_unit.default_script.name
    assert_equal 'my_experiment', alternate_unit_group_unit.experiment_name

    default_script = Script.find_by(name: 'script2')
    expected_position = unit_group.default_unit_group_units.find_by(script: default_script).position
    assert_equal expected_position, alternate_unit_group_unit.position,
      'an alternate script must have the same position as the default script it replaces'

    assert_response :success
  end

  test "update: sets published_state on units in unit group" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    course = create :unit_group, name: 'course'
    unit1 = create :script, name: 'unit1'
    unit2 = create :script, name: 'unit2'

    post :update, params: {
      course_name: 'course',
      scripts: ['unit1', 'unit2'],
      published_state: SharedConstants::PUBLISHED_STATE.stable
    }
    course.reload
    unit1.reload
    unit2.reload

    assert_equal course.published_state, SharedConstants::PUBLISHED_STATE.stable
    assert_equal unit1.published_state, SharedConstants::PUBLISHED_STATE.stable
    assert_equal unit2.published_state, SharedConstants::PUBLISHED_STATE.stable
  end

  test "update: sets pilot_experiment on units in unit group" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    course = create :unit_group, name: 'course'
    unit1 = create :script, name: 'unit1'
    unit2 = create :script, name: 'unit2'

    post :update, params: {
      course_name: 'course',
      scripts: ['unit1', 'unit2'],
      pilot_experiment: 'my-pilot'
    }
    course.reload
    unit1.reload
    unit2.reload

    assert_equal course.pilot_experiment, 'my-pilot'
    assert_equal unit1.pilot_experiment, 'my-pilot'
    assert_equal unit2.pilot_experiment, 'my-pilot'
  end

  test "update: persists changes localizeable strings" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp-2017'

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles'}
    assert_equal "Computer Science Principles ('17-'18)", UnitGroup.find_by_name!('csp-2017').summarize[:title]
  end

  test "update: persists changes to course_params" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, name: 'csp-2019'

    assert_nil unit_group.version_year
    assert_nil unit_group.family_name
    refute unit_group.has_verified_resources
    refute unit_group.visible?
    refute unit_group.stable?

    post :update, params: {
      course_name: unit_group.name,
      version_year: '2019',
      family_name: 'csp',
      has_verified_resources: 'on',
      published_state: SharedConstants::PUBLISHED_STATE.stable
    }
    unit_group.reload

    assert_equal '2019', unit_group.version_year
    assert_equal 'csp', unit_group.family_name
    assert unit_group.has_verified_resources
    assert unit_group.visible?
    assert unit_group.stable?
  end

  test "update: published state of stable sets visible correctly" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, name: 'csp-2019'

    refute unit_group.visible?

    post :update, params: {
      course_name: unit_group.name,
      published_state: SharedConstants::PUBLISHED_STATE.stable
    }
    unit_group.reload

    assert unit_group.visible?
  end

  test "update: published state of preview sets visible correctly" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, name: 'csp-2019'

    refute unit_group.visible?

    post :update, params: {
      course_name: unit_group.name,
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    unit_group.reload

    assert unit_group.visible?
  end

  test "update: published state of beta sets visible correctly" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, name: 'csp-2019'

    refute unit_group.visible?

    post :update, params: {
      course_name: unit_group.name,
      published_state: SharedConstants::PUBLISHED_STATE.beta
    }
    unit_group.reload

    refute unit_group.visible?
  end

  test "update: published state of pilot sets visible correctly" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, name: 'csp-2019'

    refute unit_group.visible?

    post :update, params: {
      course_name: unit_group.name,
      published_state: SharedConstants::PUBLISHED_STATE.pilot,
      pilot_experiment: 'my-pilot'
    }
    unit_group.reload

    refute unit_group.visible?
  end

  test "update: persists teacher resources for migrated unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root
    unit_group.update!(name: 'csp-2017')
    script = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta, is_migrated: true
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1
    resource1 = create :resource, course_version: course_version
    resource2 = create :resource, course_version: course_version

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', resourceIds: [resource1.id, resource2.id]}
    unit_group.reload
    assert_equal 2, unit_group.resources.length
  end

  test "update: persists student resources for migrated unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root
    unit_group.update!(name: 'csp-2017')
    script = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta, is_migrated: true
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1
    resource1 = create :resource, course_version: course_version
    resource2 = create :resource, course_version: course_version

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', studentResourceIds: [resource1.id, resource2.id]}
    unit_group.reload
    assert_equal 2, unit_group.student_resources.length
  end

  test_user_gets_response_for :vocab, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}
  test_user_gets_response_for :vocab, response: 404, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for :resources, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}
  test_user_gets_response_for :resources, response: 404, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for :standards, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}
  test_user_gets_response_for :standards, response: 404, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for :code, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}
  test_user_gets_response_for :code, response: 404, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

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
    create :unit_group, name: 'csp'

    get :edit, params: {course_name: 'csp'}
    assert_template 'courses/edit'
  end

  # tests for get_rollup_resources

  test "get_rollup_resources return rollups for a script with code, resources, standards, and vocab" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @unit_group_migrated
    lesson_group = create :lesson_group, script: @migrated_script
    lesson = create :lesson, lesson_group: lesson_group
    lesson.programming_expressions = [create(:programming_expression)]
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]
    lesson.vocabularies = [create(:vocabulary, course_version_id: course_version.id)]

    get :get_rollup_resources, params: {course_name: @unit_group_migrated.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 4, response_body.length
    assert_equal ['All Code', 'All Resources', 'All Standards', 'All Vocabulary'], response_body.map {|r| r['name']}
  end

  test "get_rollup_resources doesn't return rollups if no lesson in a script has the associated object" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @unit_group_migrated
    lesson_group = create :lesson_group, script: @migrated_script
    lesson = create :lesson, lesson_group: lesson_group
    # Only add resources and standards, not programming expressions and vocab
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]

    get :get_rollup_resources, params: {course_name: @unit_group_migrated.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 2, response_body.length
    assert_equal ['All Resources', 'All Standards'], response_body.map {|r| r['name']}
  end
end
