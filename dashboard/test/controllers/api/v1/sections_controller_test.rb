require 'test_helper'

class Api::V1::SectionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  CSP_COURSE_NAME = 'csp-2017'
  CSP_COURSE_SOFT_LAUNCHED_NAME = 'csp-2018-soft-launched'

  setup do
    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @unit_group = create(:unit_group)
    @section_with_unit_group = create(:section, user: @teacher, login_type: 'word', course_id: @unit_group.id)

    @script = create(:script)
    @section_with_script = create(:section, user: @teacher, script: Script.flappy_script)
    @student_with_script = create(:follower, section: @section_with_script).student_user

    @csp_unit_group = create(:unit_group, name: CSP_COURSE_NAME, published_state: SharedConstants::PUBLISHED_STATE.stable)
    @csp_unit_group_soft_launched = create(:unit_group, name: CSP_COURSE_SOFT_LAUNCHED_NAME, published_state: SharedConstants::PUBLISHED_STATE.preview)
    @csp_script = create(:script, name: 'csp1')
    create(:unit_group_unit, unit_group: @csp_unit_group, script: @csp_script, position: 1)
  end

  test 'logged out cannot list sections' do
    get :index
    assert_response :forbidden
  end

  test 'students own zero sections' do
    sign_in @student
    get :index
    assert_response :success
    assert_equal '[]', @response.body
  end

  test 'teacher with no sections indexes zero sections' do
    sign_in create :teacher
    get :index
    assert_response :success
    assert_equal '[]', @response.body
  end

  test 'returns all sections belonging to teacher' do
    sign_in @teacher

    get :index
    assert_response :success

    expected = @teacher.sections.map(&:summarize).as_json
    assert_equal expected, returned_json
  end

  # It's easy to accidentally grant admins permission to `index` all sections
  # in the database - a huge query that we don't want to permit.  Admin users
  # should therefore only get their own sections when indexing sections,
  # even though they'll have permission to pull up details for any section.
  test 'admin can only index own sections' do
    admin = create :admin
    create(:section, user: admin, login_type: 'email')

    sign_in admin
    get :index
    assert_response :success
    expected = admin.sections.map(&:summarize).as_json
    assert_equal expected, returned_json
  end

  test 'specifies course_id for sections that have one assigned' do
    sign_in @teacher

    get :index
    assert_response :success

    course_id = returned_json.find {|section| section['id'] == @section_with_unit_group.id}['course_id']
    assert_equal @unit_group.id, course_id
  end

  test 'logged out cannot view section detail' do
    get :show, params: {id: @section.id}
    assert_response :forbidden
  end

  test 'student cannot view section detail' do
    sign_in @student
    get :show, params: {id: @section.id}
    assert_response :forbidden
  end

  test "teacher cannot view another teacher's section detail" do
    sign_in create :teacher
    get :show, params: {id: @section.id}
    assert_response :forbidden
  end

  test 'teacher cannot view nonexistent section details' do
    sign_in @teacher
    get :show, params: {id: 1_000_000}
    assert_response :forbidden
  end

  test 'summarizes section details' do
    sign_in @teacher

    get :show, params: {id: @section.id}
    assert_response :success
    assert_equal @section.summarize.to_json, @response.body
  end

  test 'specifies course_id' do
    sign_in @teacher

    get :show, params: {id: @section_with_unit_group.id}
    assert_response :success

    assert_equal @unit_group.id, returned_json['course_id']
  end

  test "join with invalid section code" do
    post :join, params: {id: 'xxxxxx'}
    assert_response :bad_request
    assert_equal "section_notfound", returned_json['result']
  end

  test "join with a full section code" do
    student = create :student
    sign_in student
    section = create(:section, login_type: 'email')

    500.times do
      create(:follower, section: section)
    end

    post :join, params: {id: section.code}
    assert_response :forbidden
    assert_equal "section_full", returned_json['result']
  end

  test "join with a restricted section code" do
    student = create :student
    sign_in student
    section = create(:section, login_type: 'email', restrict_section: true)
    post :join, params: {id: section.code}
    assert_response :forbidden
    assert_equal "section_restricted", returned_json['result']
  end

  test "join with nobody signed in" do
    post :join, params: {id: @section.code}
    assert_response 404
  end

  test "join with valid section code" do
    student = create :student
    sign_in student
    post :join, params: {id: @section.code}
    assert_response :success
  end

  test "join with valid section code twice" do
    student = create :student
    sign_in student
    post :join, params: {id: @section.code}
    assert_response :success

    post :join, params: {id: @section.code}
    assert_response :success
    assert_equal "exists", returned_json['result']
  end

  test "leave with invalid section code" do
    post :leave, params: {id: 'xxxxxx'}
    assert_response :bad_request
    assert_equal "section_notfound", returned_json['result']
  end

  test "leave with nobody signed in" do
    post :leave, params: {id: @section.code}
    assert_response 404
  end

  test "leave with valid joined section code" do
    sign_in @student
    post :leave, params: {id: @section.code}
    assert_response :success
  end

  test "leave with valid unjoined section code" do
    student = create :student
    sign_in student
    post :leave, params: {id: @section.code}
    assert_response 403
  end

  test 'logged out cannot create a section' do
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }
    assert_response :forbidden
  end

  test 'student cannot create a section' do
    sign_in @student
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }
    assert_response :forbidden
  end

  test 'teacher can create a section' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }
    assert_response :success
    refute_nil returned_section
  end

  test 'creating a section returns the section summary' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }

    # See section_test.rb for tests covering the shape of the section summary.
    assert_equal returned_section.summarize.with_indifferent_access,
      returned_json.with_indifferent_access
  end

  test 'current user owns the created section' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }

    assert_equal @teacher.name, returned_json['teacherName']
    assert_equal @teacher, returned_section.user
  end

  test 'cannot override user_id during creation' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      user_id: (@teacher.id + 1),
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_equal @teacher.name, returned_json['teacherName']
    assert_equal @teacher, returned_section.user
  end

  test 'can name section during creation' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      name: 'Glulx',
    }

    assert_equal 'Glulx', returned_json['name']
    assert_equal 'Glulx', returned_section.name
  end

  test 'default name is Untitled Section' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      name: '',
    }

    assert_equal 'Untitled Section', returned_json['name']
    assert_equal 'Untitled Section', returned_section.name
  end

  test 'default name is used if provided name is all whitespace' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      name: " \r\n\t",
    }

    assert_equal 'Untitled Section', returned_json['name']
    assert_equal 'Untitled Section', returned_section.name
  end

  Section::LOGIN_TYPES.each do |desired_type|
    test "can set login_type to #{desired_type} during creation" do
      sign_in @teacher
      post :create, params: {
        login_type: desired_type,
      }

      assert_equal desired_type, returned_json['login_type']
      assert_equal desired_type, returned_section.login_type
    end
  end

  test "cannot pass empty or invalid login_type" do
    sign_in @teacher
    [nil, '', 'none', 'golmac'].each do |empty_type|
      post :create, params: {
        login_type: empty_type,
      }
      assert_response :bad_request
    end
  end

  %w(K 1 2 3 4 5 6 7 8 9 10 11 12 Other).each do |desired_grade|
    test "can set grade to #{desired_grade} during creation" do
      sign_in @teacher
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        grade: desired_grade,
      }
      assert_equal desired_grade, returned_section.grade
    end
  end

  test "default grade is nil" do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      grade: nil,
    }
    assert_nil returned_section.grade
  end

  test 'cannot pass an invalid grade' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      grade: '13',
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_nil returned_section.grade
  end

  test 'creates a six-letter section code' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }
    assert_response :success

    assert_equal 6, returned_json['code'].size
    assert_equal 6, returned_section.code.size
  end

  test 'cannot override section code' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      code: 'ABCDEF', # Won't be generated, includes vowels
    }
    # TODO: Better to fail here?
    assert_response :success

    refute_equal 'ABCDEF', returned_section.code
  end

  test 'can set lesson_extras to TRUE or FALSE during creation' do
    sign_in @teacher
    [true, false].each do |desired_value|
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        lesson_extras: desired_value,
      }

      assert_equal desired_value, returned_json['lesson_extras']
      assert_equal desired_value, returned_section.lesson_extras
    end
  end

  test 'default lesson_extras value is FALSE' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }

    assert_equal false, returned_json['lesson_extras']
    assert_equal false, returned_section.lesson_extras
  end

  test 'cannot set lesson_extras to an invalid value' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      lesson_extras: 'KREBF',
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_equal true, returned_json['lesson_extras']
    assert_equal true, returned_section.lesson_extras
  end

  test 'can set pairing_allowed to TRUE or FALSE during creation' do
    sign_in @teacher
    [true, false].each do |desired_value|
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        pairing_allowed: desired_value,
      }

      assert_equal desired_value, returned_json['pairing_allowed']
      assert_equal desired_value, returned_section.pairing_allowed
    end
  end

  test 'default pairing_allowed value is TRUE' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }

    assert_equal true, returned_json['pairing_allowed']
    assert_equal true, returned_section.pairing_allowed
  end

  test 'cannot set pairing_allowed to an invalid value' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      pairing_allowed: 'KREBF',
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_equal true, returned_json['pairing_allowed']
    assert_equal true, returned_section.pairing_allowed
  end

  [CSP_COURSE_NAME, CSP_COURSE_SOFT_LAUNCHED_NAME].each do |existing_unit_group_name|
    test "can create with a course id but no script id - #{existing_unit_group_name}" do
      existing_unit_group = UnitGroup.find_by(name: existing_unit_group_name)

      sign_in @teacher
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        course_id: existing_unit_group.id,
      }

      assert_equal existing_unit_group.id, returned_json['course_id']
      assert_equal existing_unit_group, returned_section.unit_group
      assert_nil returned_json['script']['id']
      assert_nil returned_section.script
    end
  end

  test 'cannot assign an invalid course id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      course_id: @unit_group.id, # Not CSP or CSD
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_nil returned_json['course_id']
    assert_nil returned_section.unit_group
  end

  test 'can create with a script id but no course id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      script: {id: @script.id},
    }

    assert_equal @script.id, returned_json['script']['id']
    assert_equal @script, returned_section.script
    assert_nil returned_json['course_id']
    assert_nil returned_section.unit_group
  end

  test 'cannot assign an invalid script id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      script: {id: 'MALYON'}, # Script IDs are numeric
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_nil returned_json['script']['id']
    assert_nil returned_section.script
    assert_nil returned_json['course_id']
    assert_nil returned_section.unit_group
  end

  [CSP_COURSE_NAME, CSP_COURSE_SOFT_LAUNCHED_NAME].each do |existing_unit_group_name|
    test "can create with both a course id and a script id - #{existing_unit_group_name}" do
      existing_unit_group = UnitGroup.find_by(name: existing_unit_group_name)

      sign_in @teacher
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        course_id: existing_unit_group.id,
        script: {id: @csp_script.id},
      }

      assert_equal existing_unit_group.id, returned_json['course_id']
      assert_equal existing_unit_group, returned_section.unit_group
      assert_equal @csp_script.id, returned_json['script']['id']
      assert_equal @csp_script, returned_section.script
    end
  end

  test 'creating a section with a script assigns the script to the creating user' do
    teacher = create :teacher
    sign_in teacher
    teacher.assign_script @csp_script
    assert_includes teacher.scripts, @csp_script
    refute_includes teacher.scripts, @script

    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      script: {id: @script.id},
    }
    assert_response :success
    assert_includes teacher.scripts, @csp_script
    assert_includes teacher.scripts, @script
  end

  test 'creating a section with a script does not assign script if it was already assigned' do
    teacher = create :teacher
    sign_in teacher
    teacher.assign_script @script
    original_user_script = teacher.user_scripts.first
    assert_equal 1, teacher.scripts.size

    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      script: {id: @script.id},
    }
    assert_response :success
    assert_equal 1, teacher.scripts.size
    assert_equal original_user_script, teacher.user_scripts.first
  end

  test 'creating a section with a course does not assign a script' do
    sign_in @teacher
    assert_equal 0, @teacher.scripts.size

    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      course_id: @csp_unit_group.id,
    }
    assert_response :success
    assert_equal 0, @teacher.scripts.size
  end

  test 'creating a section with no course or script does not assign a script' do
    sign_in @teacher
    assert_equal 0, @teacher.scripts.size

    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }
    assert_response :success
    assert_equal 0, @teacher.scripts.size
  end

  test "update: can update section you own" do
    UnitGroup.stubs(:valid_course_id?).returns(true)

    sign_in @teacher
    section_with_script = create(
      :section,
      user: @teacher,
      script_id: Script.flappy_script.id,
      login_type: Section::LOGIN_TYPE_WORD,
      grade: "1",
      lesson_extras: true,
      pairing_allowed: false,
      hidden: true
    )

    post :update, params: {
      id: section_with_script.id,
      course_id: @unit_group.id,
      name: "My Section",
      login_type: Section::LOGIN_TYPE_PICTURE,
      grade: "K",
      lesson_extras: false,
      pairing_allowed: true,
      hidden: false
    }
    assert_response :success

    # Cannot use section_with_script.reload because login_type has changed
    section_with_script = Section.find(section_with_script.id)

    assert_equal(@unit_group.id, section_with_script.course_id)
    assert_nil(section_with_script.script_id)
    assert_equal("My Section", section_with_script.name)
    assert_equal(Section::LOGIN_TYPE_PICTURE, section_with_script.login_type)
    assert_equal("K", section_with_script.grade)
    assert_equal(false, section_with_script.lesson_extras)
    assert_equal(true, section_with_script.pairing_allowed)
    assert_equal(false, section_with_script.hidden)

    post :update, params: {
      id: section_with_script.id,
      lesson_extras: true,
    }
    section_with_script = Section.find(section_with_script.id)
    assert_equal(true, section_with_script.lesson_extras)
  end

  test "update: name is ignored if empty or all whitespace" do
    UnitGroup.stubs(:valid_course_id?).returns(true)

    section = create :section, name: 'Old section name'
    sign_in section.teacher

    post :update, params: {
      id: section.id,
      name: " \r\n\t"
    }
    assert_response :success

    section.reload
    assert_equal 'Old section name', section.name
  end

  test "update: course_id is cleared if not provided and script has no default course" do
    sign_in @teacher
    section = create(:section, user: @teacher, course_id: @unit_group.id)

    refute_nil section.course_id

    post :update, params: {
      id: section.id
    }
    section.reload
    assert_response :success
    assert_nil section.course_id
  end

  test "update: sets course to script's default course if course_id is not provided" do
    sign_in @teacher
    section = create(:section, user: @teacher, course_id: nil)

    post :update, params: {
      id: section.id,
      script_id: @csp_script.id
    }
    section.reload
    assert_response :success
    assert_equal @csp_script.id, section.script_id
    assert_equal @csp_script.unit_group.id, section.course_id
  end

  test "update: script_id is cleared if not provided" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: @csp_script.id)

    refute_nil section.script_id

    post :update, params: {
      id: section.id
    }
    section.reload
    assert_response :success
    assert_nil section.script_id
  end

  test "update: course_id is not updated if invalid" do
    UnitGroup.stubs(:valid_course_id?).returns(false)

    sign_in @teacher
    section = create(:section, user: @teacher, course_id: nil)

    post :update, params: {
      id: section.id,
      course_id: 1,
    }
    section.reload
    assert_response :success
    assert_nil section.course_id
  end

  test "update: script_id is not updated if invalid" do
    Script.stubs(:valid_script_id?).returns(false)

    sign_in @teacher
    section = create(:section, user: @teacher, script_id: nil)

    post :update, params: {
      id: section.id,
      script_id: 1,
    }
    section.reload
    assert_response :success
    assert_nil section.script_id
  end

  test "update: hidden script is unhidden when assigned" do
    sign_in @teacher
    @section.toggle_hidden_script @csp_script, true
    refute_nil SectionHiddenScript.find_by(script: @csp_script, section: @section)
    post :update, params: {
      id: @section.id,
      script_id: @csp_script.id,
    }
    assert_nil SectionHiddenScript.find_by(script: @csp_script, section: @section)
  end

  test "update: cannot update section you dont own" do
    other_teacher = create(:teacher)
    sign_in other_teacher
    post :update, params: {
      id: @section.id,
      course_id: @unit_group.id,
    }
    assert_response :forbidden
  end

  test "update: cannot update section if not logged in " do
    post :update, params: {
      id: @section.id,
      course_id: @unit_group.id,
    }
    assert_response :forbidden
  end

  test "update: can set course and script" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, as: :json, params: {
      id: section.id,
      course_id: @csp_unit_group.id,
      script_id: @csp_script.id
    }
    assert_response :success
    section.reload
    assert_equal(@csp_unit_group.id, section.course_id)
    assert_equal(@csp_script.id, section.script_id)
  end

  test "update: non-matching course/script rejected" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, params: {
      id: section.id,
      course_id: @unit_group.id,
      script_id: Script.artist_script.id
    }
    assert_response 400
  end

  test "update: can set course-less script" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, params: {
      id: section.id,
      script_id: Script.artist_script.id
    }
    assert_response :success
    section.reload
    assert_nil section.course_id
    assert_equal(Script.artist_script.id, section.script_id)
  end

  test "update: setting a script results in UserScripts for students" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    student = create(:follower, section: section).student_user

    assert_nil UserScript.find_by(script: Script.artist_script, user: student)

    post :update, params: {
      id: section.id,
      script_id: Script.artist_script.id
    }

    assert_not_nil UserScript.find_by(script: Script.artist_script, user: student)
  end

  test "update: can set script from nested script param" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, as: :json, params: {
      id: section.id,
      script: {id: @script.id}
    }
    assert_response :success
    section.reload
    assert_equal(@script.id, section.script_id)
  end

  test 'logged out cannot delete a section' do
    delete :destroy, params: {id: @section.id}
    assert_response :forbidden
  end

  test 'student cannot delete a section' do
    sign_in @student
    delete :destroy, params: {id: @section.id}
    assert_response :forbidden
  end

  test "teacher cannot delete another teacher's section" do
    sign_in create :teacher
    delete :destroy, params: {id: @section.id}
    assert_response :forbidden
  end

  test 'teacher can delete own section' do
    teacher = create :teacher
    section = create :section, user: teacher, login_type: 'word'
    sign_in teacher
    refute section.deleted_at

    delete :destroy, params: {id: section.id}
    assert_response :success

    section.reload
    refute_nil section.deleted_at
  end

  test 'admin can delete unowned sections' do
    sign_in create :admin
    refute @section.deleted_at

    delete :destroy, params: {id: @section.id}
    assert_response :success

    @section.reload
    refute_nil @section.deleted_at
  end

  test 'deleting section deletes followers too' do
    sign_in @teacher
    refute_empty @section.followers

    delete :destroy, params: {id: @section.id}
    assert_response :success

    @section.reload
    assert_empty @section.followers
  end

  # Parsed JSON returned after the last request, for easy assertions.
  # Returned hash has string keys
  def returned_json
    JSON.parse @response.body
  end

  # Reference to the Section model instance referred to by the last JSON
  # response, for additional assertions about the state of the database.
  def returned_section
    Section.find returned_json['id']
  end

  test "update_sharing_disabled updates sharing_disabled" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update_sharing_disabled, params: {
      id: section.id,
      sharing_disabled: true
    }
    assert_response :success
    section.reload
    assert_equal(true, section.sharing_disabled)

    post :update_sharing_disabled, params: {
      id: section.id,
      sharing_disabled: false
    }
    assert_response :success
    section.reload
    assert_equal(false, section.sharing_disabled)
  end

  test "update_sharing_disabled: cannot update section you dont own" do
    other_teacher = create(:teacher)
    sign_in other_teacher
    post :update_sharing_disabled, params: {
      id: @section.id,
      sharing_disabled: true,
    }
    assert_response :forbidden
  end

  test "update_sharing_disabled: cannot update section if not logged in " do
    post :update_sharing_disabled, params: {
      id: @section.id,
      sharing_disabled: true,
    }
    assert_response :forbidden
  end

  test 'anonymous user cannot access student_script_ids' do
    get :student_script_ids, params: {id: @section_with_script.id}
    assert_response :forbidden
  end

  test 'teacher can access student_script_ids' do
    sign_in @teacher

    get :student_script_ids, params: {id: @section_with_script.id}
    assert_response :success
    ids = JSON.parse(@response.body)
    assert_equal({'studentScriptIds' => [Script.flappy_script.id]}, ids)

    # make sure we include other scripts which the student has progress in
    create(:user_script, user: @student_with_script, script: Script.frozen_script)

    get :student_script_ids, params: {id: @section_with_script.id}
    assert_response :success
    ids = JSON.parse(@response.body)
    assert_equal({'studentScriptIds' => [Script.flappy_script.id, Script.frozen_script.id]}, ids)
  end

  test 'student cannot access student_script_ids' do
    sign_in @student_with_script
    get :student_script_ids, params: {id: @section_with_script.id}
    assert_response :forbidden
  end

  test "membership: returns status 403 'Forbidden' when not signed in" do
    get :membership
    assert_response :forbidden
  end

  test "membership: returns section names and ids for student" do
    sign_in @student_with_script
    get :membership
    assert_response :success
    expected_response = [{id: @section_with_script.id, name: @section_with_script.name}].as_json
    assert_equal(expected_response, json_response)
  end

  test "membership: returns section names and ids for teacher" do
    new_section = create(:section, user: @teacher, login_type: 'word')
    new_teacher = create :teacher
    new_section.students << new_teacher

    sign_in new_teacher
    get :membership
    assert_response :success
    expected_response = [{id: new_section.id, name: new_section.name}].as_json
    assert_equal(expected_response, json_response)
  end

  test "membership: returns empty array for student sections if none exist for student" do
    student = create(:student)
    sign_in student
    get :membership
    assert_response :success
    assert_equal([], json_response)
  end

  test "membership: returns empty array for student sections if none exist for teacher" do
    sign_in @teacher
    get :membership
    assert_response :success
    assert_equal([], json_response)
  end

  test "valid_scripts: returns 403 'Forbidden' when not signed in" do
    get :valid_scripts
    assert_response :forbidden
  end

  test "valid_scripts: returns scripts for any signed in user" do
    user = create(:user)
    sign_in user
    get :valid_scripts
    assert_response :success
  end

  test "require_captcha: returns 403 'Forbidden' when not signed in" do
    get :require_captcha
    assert_response :forbidden
  end

  # TODO: Update once captcha logic in user model is inserted
  test "require_captcha: returns object with recaptcha site key" do
    user = create(:user)
    sign_in user
    get :require_captcha
    expected_response = {key: Recaptcha.configuration.site_key}.as_json
    assert_equal(expected_response, json_response)
  end

  test "require_captcha: serves non-nil site key to the client side" do
    # Use Google's publicly available test keys:
    # https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
    GOOGLE_PROVIDED_TEST_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    CDO.stubs(:recaptcha_site_key).returns(GOOGLE_PROVIDED_TEST_KEY)
    user = create(:user)
    sign_in user
    get :require_captcha
    assert_equal(json_response["key"], GOOGLE_PROVIDED_TEST_KEY)
  end
end
