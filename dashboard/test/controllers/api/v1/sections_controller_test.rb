require 'test_helper'

class Api::V1::SectionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  setup do
    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @course = create(:course)
    @section_with_course = create(:section, user: @teacher, login_type: 'word', course_id: @course.id)

    @script = create(:script)

    @csp_course = create(:course, name: 'csp')
    @csp_script = create(:script, name: 'csp1')
    create(:course_script, course: @csp_course, script: @csp_script, position: 1)
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

    expected = @teacher.sections.map {|section| section.summarize.with_indifferent_access}
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
    expected = admin.sections.map {|section| section.summarize.with_indifferent_access}
    assert_equal expected, returned_json
  end

  test 'specifies course_id for sections that have one assigned' do
    sign_in @teacher

    get :index
    assert_response :success

    course_id = returned_json.find {|section| section['id'] == @section_with_course.id}['course_id']
    assert_equal @course.id, course_id
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

    get :show, params: {id: @section_with_course.id}
    assert_response :success

    assert_equal @course.id, returned_json['course_id']
  end

  test "join with invalid section code" do
    post :join, params: {id: 'xxxxxx'}
    assert_response :bad_request
    assert_equal "section_notfound", returned_json['result']
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

  test 'default name is New Section' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      name: '',
    }

    assert_equal 'New Section', returned_json['name']
    assert_equal 'New Section', returned_section.name
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

  test 'can set stage_extras to TRUE or FALSE during creation' do
    sign_in @teacher
    [true, false].each do |desired_value|
      post :create, params: {
        login_type: Section::LOGIN_TYPE_EMAIL,
        stage_extras: desired_value,
      }

      assert_equal desired_value, returned_json['stage_extras']
      assert_equal desired_value, returned_section.stage_extras
    end
  end

  test 'default stage_extras value is FALSE' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
    }

    assert_equal false, returned_json['stage_extras']
    assert_equal false, returned_section.stage_extras
  end

  test 'cannot set stage_extras to an invalid value' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      stage_extras: 'KREBF',
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_equal true, returned_json['stage_extras']
    assert_equal true, returned_section.stage_extras
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

  test 'can create with a course id but no script id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      course_id: @csp_course.id,
    }

    assert_equal @csp_course.id, returned_json['course_id']
    assert_equal @csp_course, returned_section.course
    assert_nil returned_json['script']['id']
    assert_nil returned_section.script
  end

  test 'cannot assign an invalid course id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      course_id: @course.id, # Not CSP or CSD
    }
    assert_response :success
    # TODO: Better to fail here?

    assert_nil returned_json['course_id']
    assert_nil returned_section.course
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
    assert_nil returned_section.course
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
    assert_nil returned_section.course
  end

  test 'can create with both a course id and a script id' do
    sign_in @teacher
    post :create, params: {
      login_type: Section::LOGIN_TYPE_EMAIL,
      course_id: @csp_course.id,
      script: {id: @csp_script.id},
    }

    assert_equal @csp_course.id, returned_json['course_id']
    assert_equal @csp_course, returned_section.course
    assert_equal @csp_script.id, returned_json['script']['id']
    assert_equal @csp_script, returned_section.script
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
      course_id: @csp_course.id,
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
end
