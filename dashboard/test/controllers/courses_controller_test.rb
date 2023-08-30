require 'test_helper'

class CoursesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create :teacher
    @levelbuilder = create :levelbuilder

    @in_development_unit_group = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit_group = create :unit_group, pilot_experiment: 'my-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
    @pilot_section = create :section, user: @pilot_teacher, unit_group: @pilot_unit_group
    @pilot_student = create(:follower, section: @pilot_section).student_user

    @pilot_facilitator = create :facilitator, pilot_experiment: 'my-pl-experiment'
    @pilot_pl_unit_group = create :unit_group, pilot_experiment: 'my-pl-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    @pilot_pl_section = create :section, user: @pilot_facilitator, unit_group: @pilot_pl_unit_group
    @pilot_participant = create :teacher
    create(:follower, section: @pilot_pl_section, student_user: @pilot_participant)

    @unit_group_regular = create :unit_group, name: 'non-plc-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta

    @migrated_pl_unit = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    @pl_unit_group_migrated = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group_unit, unit_group: @pl_unit_group_migrated, script: @migrated_pl_unit, position: 1
    @migrated_pl_unit.reload

    @unmigrated_unit = create :script, is_migrated: false, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    @unit_group_unmigrated = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: @unit_group_unmigrated, script: @unmigrated_unit, position: 1
  end

  setup do
    sign_in @teacher

    @migrated_unit = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    @unit_group_migrated = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: @unit_group_migrated, script: @migrated_unit, position: 1

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)
  end

  class CoursesQueryCountTests < ActionController::TestCase
    setup do
      Unit.stubs(:should_cache?).returns true
      Unit.clear_cache
      UnitGroup.clear_cache

      @unit_group_regular = create :unit_group, name: 'non-plc-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    end

    test_user_gets_response_for :index, response: :success, user: :teacher, queries: 4

    test_user_gets_response_for :index, response: :success, user: :admin, queries: 4

    test_user_gets_response_for :index, response: :success, user: :user, queries: 4

    test_user_gets_response_for :show, response: :success, user: :teacher, params: -> {{course_name: @unit_group_regular.name}}, queries: 10

    test_user_gets_response_for :show, response: :forbidden, user: :admin, params: -> {{course_name: @unit_group_regular.name}}, queries: 2
  end

  class CachedQueryCounts < ActionController::TestCase
    setup do
      Unit.stubs(:should_cache?).returns true
      Unit.clear_cache
      UnitGroup.clear_cache

      offering = create :course_offering, key: 'csx'

      @unit_group = create :unit_group, name: 'csx-3001', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'csx', version_year: '3001'
      create :course_version, course_offering: offering, content_root: @unit_group, key: '3001'
      unit1 = create :unit, name: 'csx1-3001', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
      create :unit_group_unit, unit_group: @unit_group, script: unit1, position: 1
      unit2 = create :unit, name: 'csx2-3001', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
      create :unit_group_unit, unit_group: @unit_group, script: unit2, position: 2

      older_unit_group = create :unit_group, name: 'csx-3000', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'csx', version_year: '3000'
      create :course_version, course_offering: offering, content_root: older_unit_group, key: '3000'
      unit1 = create :unit, name: 'csx1-3000', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
      create :unit_group_unit, unit_group: older_unit_group, script: unit1, position: 1
      unit2 = create :unit, name: 'csx2-3000', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
      create :unit_group_unit, unit_group: older_unit_group, script: unit2, position: 2
    end

    test 'signed out user views course overview with caching enabled' do
      assert_cached_queries(0) do
        get :show, params: {course_name: @unit_group.name}
      end
    end

    test 'student views course overview with caching enabled' do
      sign_in create(:student)
      assert_cached_queries(6) do
        get :show, params: {course_name: @unit_group.name}
      end
    end

    test 'teacher views course overview with caching enabled' do
      sign_in create(:teacher)
      assert_cached_queries(9) do
        get :show, params: {course_name: @unit_group.name}
      end
    end
  end

  test "show: regular courses get sent to show" do
    get :show, params: {course_name: @unit_group_regular.name}
    assert_template 'courses/show'
  end

  test "show: non existant course throws" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'nosuchcourse'}
    end
  end

  test "show: redirect to latest stable version in course family" do
    offering = create :course_offering, key: 'csp'
    ug2018 = create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2018, key: '2018'
    ug2019 = create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2019, key: '2019'
    ug2020 = create :unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :course_version, course_offering: offering, content_root: ug2020, key: '2020'
    get :show, params: {course_name: 'csp'}
    assert_redirected_to '/courses/csp-2019'

    Rails.cache.delete("course_version/course_offering_keys/UnitGroup")
    offering = create :course_offering, key: 'csd'
    ug2018 = create :unit_group, name: 'csd-2018', family_name: 'csd', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2018, key: '2018'
    ug2019 = create :unit_group, name: 'csd-2019', family_name: 'csd', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2019, key: '2019'
    ug2020 = create :unit_group, name: 'csd-2020', family_name: 'csd', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :course_version, course_offering: offering, content_root: ug2020, key: '2020'
    get :show, params: {course_name: 'csd'}
    assert_redirected_to '/courses/csd-2019'
  end

  test "get_unit_group for family name with no stable versions does not redirect" do
    Rails.cache.delete("course_version/course_offering_keys/UnitGroup")
    offering = create :course_offering, key: 'csd'
    ug2020 = create :unit_group, name: 'csd-2020', family_name: 'csd', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :course_version, course_offering: offering, content_root: ug2020, key: '2020'
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {course_name: 'csd'}
    end
  end

  test 'redirect to latest standards in course family' do
    Rails.cache.delete("course_version/course_offering_keys/UnitGroup")

    offering = create :course_offering, key: 'csp'
    ug2018 = create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2018, key: '2018'
    ug2019 = create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :course_version, course_offering: offering, content_root: ug2019, key: '2019'
    ug2020 = create :unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :course_version, course_offering: offering, content_root: ug2020, key: '2020'

    get :standards, params: {course_name: 'csp'}

    assert_redirected_to '/courses/csp-2019/standards'
  end

  test "show: redirect from new unstable version to assigned version" do
    student = create :student
    csp2017 = create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :follower, section: create(:section, unit_group: csp2017), student_user: student
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta

    sign_in student
    get :show, params: {course_name: 'csp-2019'}

    assert_redirected_to '/courses/csp-2017/?redirect_warning=true'
  end

  test "show: redirect participant from new unstable version to assigned version" do
    teacher = create :teacher
    plcsp2017 = create :unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :follower, section: create(:section, unit_group: plcsp2017), student_user: teacher
    create :unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group, name: 'pl-csp-2019', family_name: 'pl-csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    sign_in teacher
    get :show, params: {course_name: 'pl-csp-2019'}

    assert_redirected_to '/courses/pl-csp-2017/?redirect_warning=true'
  end

  test "show: redirect to latest stable version in course family for logged out user" do
    sign_out @teacher
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta

    get :show, params: {course_name: 'csp-2017'}

    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect to latest stable version if no_redirect query param provided" do
    sign_out @teacher
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    get :show, params: {course_name: 'csp-2017', no_redirect: "true"}
    assert_response :ok
    get :show, params: {course_name: 'csp-2017'}
    assert_response :ok
  end

  test "show: redirect to latest stable version in course family for student" do
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta

    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}
    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'

    get :show, params: {course_name: 'csp-2019'}
    assert_redirected_to '/courses/csp-2018/?redirect_warning=true'
  end

  test "show: redirect to latest stable version in course family for participant" do
    create :unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group, name: 'pl-csp-2019', family_name: 'pl-csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    sign_in create(:teacher)
    get :show, params: {course_name: 'pl-csp-2017'}
    assert_redirected_to '/courses/pl-csp-2018/?redirect_warning=true'

    get :show, params: {course_name: 'pl-csp-2019'}
    assert_redirected_to '/courses/pl-csp-2018/?redirect_warning=true'
  end

  test "show: do not redirect student to latest stable version in course family if they have progress" do
    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    UnitGroup.any_instance.stubs(:has_progress?).returns(true)
    sign_in create(:student)
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect participant to latest stable version in course family if they have progress" do
    create :unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    UnitGroup.any_instance.stubs(:has_progress?).returns(true)
    sign_in create(:teacher)
    get :show, params: {course_name: 'pl-csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect student to latest stable version in course family if they are assigned" do
    student = create :student
    csp2017 = create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :follower, section: create(:section, unit_group: csp2017), student_user: student
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    sign_in student
    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect participant to latest stable version in course family if they are assigned" do
    teacher = create :teacher
    plcsp2017 = create :unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :follower, section: create(:section, unit_group: plcsp2017), student_user: teacher
    create :unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    sign_in teacher
    get :show, params: {course_name: 'pl-csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in course family" do
    teacher = create :teacher
    sign_in teacher

    create :unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    get :show, params: {course_name: 'csp-2017'}

    assert_response :ok
  end

  test "show: do not redirect instructor to latest stable version in course family" do
    facilitator = create :facilitator
    sign_in facilitator

    create :unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    create :unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    get :show, params: {course_name: 'pl-csp-2017'}

    assert_response :ok
  end

  test "show: shows course when family name matches course name" do
    course = create :unit_group, name: 'new-course', family_name: 'new-course', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(course)

    get :show, params: {course_name: 'new-course'}

    assert_response :ok
  end

  no_access_msg = "You don&#39;t have access to this course."

  test_user_gets_response_for :show, response: :redirect, user: nil,
                              params: -> {{course_name: @pl_unit_group_migrated.name}},
                              name: 'signed out user cannot view pl course'

  test_user_gets_response_for(:show, response: :success, user: :student,
                              params: -> {{course_name: @pl_unit_group_migrated.name}},
                              name: 'student user cannot view pl course'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for :show, response: :redirect, user: nil,
                              params: -> {{course_name: @pilot_unit_group.name}},
                              name: 'signed out user cannot view pilot course'

  test_user_gets_response_for(:show, response: :success, user: :student,
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'student cannot view pilot course'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
                              params: -> {{course_name: @pilot_pl_unit_group.name}}, name: 'participant not in pilot section cannot view pilot course'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
                              params: -> {{course_name: @pilot_unit_group.name}},
                              name: 'teacher without pilot access cannot view pilot course'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :facilitator,
                              params: -> {{course_name: @pilot_pl_unit_group.name}},
                              name: 'instructor without pilot access cannot view pilot course'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_teacher},
                              params: -> {{course_name: @pilot_unit_group.name, section_id: @pilot_section.id}},
                              name: 'pilot teacher can view pilot course'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_facilitator},
                              params: -> {{course_name: @pilot_pl_unit_group.name, section_id: @pilot_pl_section.id}},
                              name: 'pilot instructor can view pilot course'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_student},
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'pilot student can view pilot course'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_participant},
                              params: -> {{course_name: @pilot_pl_unit_group.name}}, name: 'pilot participant can view pilot course'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
                              params: -> {{course_name: @pilot_unit_group.name}}, name: 'levelbuilder can view pilot course'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for :show, response: :redirect, user: nil,
                              params: -> {{course_name: @in_development_unit_group.name}},
                              name: 'signed out user cannot view in-development unit group'

  test_user_gets_response_for(:show, response: :success, user: :student,
                              params: -> {{course_name: @in_development_unit_group.name}}, name: 'student cannot view in-development unit group'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
                              params: -> {{course_name: @in_development_unit_group.name}},
                              name: 'teacher access cannot view in-development unit group'
  ) do
    assert_includes(response.body, no_access_msg)
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
                              params: -> {{course_name: @in_development_unit_group.name}}, name: 'levelbuilder can view in-development unit group'
  ) do
    refute_includes(response.body, no_access_msg)
  end

  # Tests for create

  test "create: fails without levelbuilder permission" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp', version_year: '1991'}
    assert_response 403
  end

  test "create: fails without version year" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert_raises do
      post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp'}
    end
  end

  test "create: fails without family name" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert_raises do
      post :create, params: {course: {name: 'csp-1992'}, version_year: '1992'}
    end
  end

  test "create: succeeds with levelbuilder permission" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp', version_year: '1991'}
    UnitGroup.find_by_name!('csp-1991')
    assert_redirected_to '/courses/csp-1991/edit'
  end

  test "create: defaults to teacher led, teacher to student course if nothing provided" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp', version_year: '1991'}
    ug = UnitGroup.find_by_name!('csp-1991')
    assert_equal ug.instruction_type, 'teacher_led'
    assert_equal ug.instructor_audience, 'teacher'
    assert_equal ug.participant_audience, 'student'
  end

  test "create: sets course type if info is provided" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    post :create, params: {course: {name: 'pl-csp-1991'}, family_name: 'pl-csp', version_year: '1991', instruction_type: 'self_paced', instructor_audience: 'universal_instructor', participant_audience: 'teacher'}
    ug = UnitGroup.find_by_name!('pl-csp-1991')
    assert_equal ug.instruction_type, 'self_paced'
    assert_equal ug.instructor_audience, 'universal_instructor'
    assert_equal ug.participant_audience, 'teacher'
  end

  test "create: writes course json file" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    File.stubs(:write).with {|filename, _| filename.to_s == "#{Rails.root}/config/courses/csp-1991.course"}.once

    post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp', version_year: '1991'}
    assert_response :redirect
  end

  test "create: failure to save redirects to new" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    UnitGroup.any_instance.stubs(:save).returns false

    post :create, params: {course: {name: 'csp-1991'}, family_name: 'csp', version_year: '1991'}
    assert_template 'courses/new'
  end

  # tests for update

  test "update: fails without levelbuilder permission" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'
    create :script, name: 'unit1'
    create :script, name: 'unit2'

    post :update, params: {course_name: 'csp', scripts: ['unit1', 'unit2']}
    assert_response 403
  end

  test "update: writes course json file" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'

    File.stubs(:write).with {|filename, _| filename.to_s == "#{Rails.root}/config/courses/csp.course"}.once

    post :update, params: {course_name: 'csp', scripts: []}
    assert_response :success
  end

  test "update: persists changes to default_unit_group_units" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'
    create :script, name: 'unit1'
    create :script, name: 'unit2'

    post :update, params: {course_name: 'csp', scripts: ['unit1', 'unit2']}
    default_unit_group_units = UnitGroup.find_by_name('csp').default_unit_group_units
    assert_equal 2, default_unit_group_units.length
    assert_equal ['unit1', 'unit2'], default_unit_group_units.map(&:script).map(&:name)

    assert_response :success
  end

  test "update: persists changes to alternate_unit_group_units" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    create :unit_group, name: 'csp'
    create :script, name: 'unit1'
    create :script, name: 'unit2'
    create :script, name: 'unit2-alt'
    create :script, name: 'unit3'

    post :update, params: {
      course_name: 'csp',
      scripts: ['unit1', 'unit2', 'unit3'],
      alternate_units: [
        {
          experiment_name: 'my_experiment',
          alternate_script: 'unit2-alt',
          default_script: 'unit2'
        }
      ]
    }
    unit_group = UnitGroup.find_by_name('csp')
    assert_equal 3, unit_group.default_unit_group_units.length
    assert_equal ['unit1', 'unit2', 'unit3'], unit_group.default_unit_group_units.map(&:script).map(&:name)

    assert_equal 1, unit_group.alternate_unit_group_units.length
    alternate_unit_group_unit = unit_group.alternate_unit_group_units.first
    assert_equal 'unit2-alt', alternate_unit_group_unit.script.name
    assert_equal 'unit2', alternate_unit_group_unit.default_script.name
    assert_equal 'my_experiment', alternate_unit_group_unit.experiment_name

    default_unit = Unit.find_by(name: 'unit2')
    expected_position = unit_group.default_unit_group_units.find_by(script: default_unit).position
    assert_equal expected_position, alternate_unit_group_unit.position,
      'an alternate unit must have the same position as the default unit it replaces'

    assert_response :success
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
    unit_group = create :unit_group, name: 'csb-2019', version_year: '2019', family_name: 'csb'

    assert_equal unit_group.version_year, '2019'
    assert_equal unit_group.family_name, 'csb'
    refute unit_group.has_verified_resources
    refute unit_group.launched?
    refute unit_group.stable?
    assert_equal unit_group.instruction_type, Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
    assert_equal unit_group.instructor_audience, Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
    assert_equal unit_group.participant_audience, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student

    post :update, params: {
      course_name: unit_group.name,
      version_year: '2019',
      family_name: 'csb',
      has_verified_resources: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable,
      instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced,
      instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator,
      participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    }
    unit_group.reload

    assert_equal '2019', unit_group.version_year
    assert_equal 'csb', unit_group.family_name
    assert unit_group.has_verified_resources
    assert unit_group.launched?
    assert unit_group.stable?
    assert_equal unit_group.instruction_type, Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced
    assert_equal unit_group.instructor_audience, Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator
    assert_equal unit_group.participant_audience, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
  end

  test "update: persists teacher resources for migrated unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, family_name: 'my-family', version_year: '2000', name: 'csp-2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version
    unit = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: unit_group, script: unit, position: 1
    resource1 = create :resource, course_version: course_version
    resource2 = create :resource, course_version: course_version

    File.stubs(:write).with do |filename, data|
      filename.to_s.end_with?("#{unit_group.name}.course") && data.include?(resource1.name) && data.include?(resource2.name)
    end.once

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', resourceIds: [resource1.id, resource2.id]}
    unit_group.reload
    assert_equal 2, unit_group.resources.length
  end

  test "update: persists student resources for migrated unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group, family_name: 'my-family', version_year: '2000', name: 'csp-2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version
    unit = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: unit_group, script: unit, position: 1
    resource1 = create :resource, course_version: course_version
    resource2 = create :resource, course_version: course_version

    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', studentResourceIds: [resource1.id, resource2.id]}
    unit_group.reload
    assert_equal 2, unit_group.student_resources.length
  end

  test "update: create course version for unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_group = create :unit_group
    unit_group.update!(name: 'csp-2017')
    script = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1

    assert_nil unit_group.course_version
    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', family_name: 'coursefamily', version_year: 2021}
    unit_group.reload
    refute_nil unit_group.course_version
  end

  test "update: cannot change course version for unit groups" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)
    unit_group = create :unit_group
    unit_group.update!(name: 'csp-2017')
    script = create :script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1

    assert_nil unit_group.course_version
    post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', family_name: 'coursefamily', version_year: 2021}
    unit_group.reload
    refute_nil unit_group.course_version

    course_version = unit_group.course_version.freeze
    unit_group.resources = [create(:resource, course_version: unit_group.course_version)]
    assert_raises do
      post :update, params: {course_name: 'csp-2017', scripts: [], title: 'Computer Science Principles', family_name: 'newcoursefamily', version_year: 2021}
    end
    unit_group.reload
    refute_nil unit_group.course_version
    assert_equal course_version, unit_group.course_version
  end

  no_access_msg = "You don&#39;t have access to this course."

  test_user_gets_response_for(:vocab, response: :success, user: :facilitator, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'instructor can view vocab page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:vocab, response: :forbidden, user: :student, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'student cant view vocab page for pl course')
  test_user_gets_response_for(:vocab, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}, name: 'teacher can view vocab page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :vocab, response: 403, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for(:resources, response: :success, user: :facilitator, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'instructor can view resources page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:resources, response: :forbidden, user: :student, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'student cant view resources page for pl course')
  test_user_gets_response_for(:resources, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}, name: 'teacher can view resources page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :resources, response: 403, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for(:standards, response: :success, user: :facilitator, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'instructor can view standards page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:standards, response: :forbidden, user: :student, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'student cant view standards page for pl course')
  test_user_gets_response_for(:standards, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}, name: 'teacher can view standards page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :standards, response: 403, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  test_user_gets_response_for(:code, response: :success, user: :facilitator, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'instructor can view code page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:code, response: :forbidden, user: :student, params: -> {{course_name: @pl_unit_group_migrated.name}}, name: 'student cant view code page for pl course')
  test_user_gets_response_for(:code, response: :success, user: :teacher, params: -> {{course_name: @unit_group_migrated.name}}, name: 'teacher can view code page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :code, response: 403, user: :teacher, params: -> {{course_name: @unit_group_unmigrated.name}}

  # tests for edit

  test "edit: does not work for plc_course" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)
    create :plc_course, name: 'plc-course'

    assert_raises ActiveRecord::ReadOnlyRecord do
      get :edit, params: {course_name: 'plc-course'}
    end
  end

  test "edit: renders edit page for regular courses" do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)
    create :unit_group, name: 'csp'

    get :edit, params: {course_name: 'csp'}
    assert_template 'courses/edit'
  end

  # tests for get_rollup_resources

  test "get_rollup_resources return rollups for a unit with code, resources, standards, and vocab" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @unit_group_migrated
    lesson_group = create :lesson_group, script: @migrated_unit
    lesson = create :lesson, lesson_group: lesson_group
    lesson.programming_expressions = [create(:programming_expression)]
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]
    lesson.vocabularies = [create(:vocabulary, course_version_id: course_version.id)]

    get :get_rollup_resources, params: {course_name: @unit_group_migrated.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 4, response_body.length
    assert_equal(['All Code', 'All Resources', 'All Standards', 'All Vocabulary'], response_body.map {|r| r['name']})
  end

  test "get_rollup_resources doesn't return rollups if no lesson in a unit has the associated object" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write)
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @unit_group_migrated
    lesson_group = create :lesson_group, script: @migrated_unit
    lesson = create :lesson, lesson_group: lesson_group
    # Only add resources and standards, not programming expressions and vocab
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]

    get :get_rollup_resources, params: {course_name: @unit_group_migrated.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 2, response_body.length
    assert_equal(['All Resources', 'All Standards'], response_body.map {|r| r['name']})
  end
end
