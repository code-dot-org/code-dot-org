require 'test_helper'

class FollowersControllerTest < ActionController::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section_1 = create(:section, user: @laurel)
    @laurel_section_2 = create(:section, user: @laurel)
    @laurel_section_script = create(:section, user: @laurel, script: Script.find_by_name('course1'))

    # add a few students to a section
    @laurel_student_1 = create(:follower, section: @laurel_section_1)
    @laurel_student_2 = create(:follower, section: @laurel_section_1)

    @chris = create(:teacher)
    @chris_section = create(:section, user: @chris)

    # student without section or teacher
    @student = create(:user)
  end

  test "student_user_new when not signed in" do
    get :student_user_new, section_code: @chris_section.code

    assert_response :success
    assert assigns(:user)

    assert !assigns(:user).persisted?
  end

  test "student_user_new without section code" do
    get :student_user_new

    assert_response :success
    # form to type in section code
    assert_select 'input#section_code'
  end

  test "student_user_new when signed in" do
    sign_in @student

    assert_creates(Follower) do
      get :student_user_new, section_code: @chris_section.code
    end

    assert_redirected_to '/'
    assert_equal "You've registered for #{@chris_section.name}.", flash[:notice]

    follower = Follower.last
    assert_equal @student, follower.student_user
    assert_equal @chris, follower.user
    assert_equal @chris_section, follower.section
  end

  test "student_user_new when signed in without section code" do
    sign_in @student

    get :student_user_new

    assert_response :success
    # form to type in section code
    assert_select 'input#section_code'
  end

  test "student_user_new when already followed by a teacher switches sections" do
    sign_in @laurel_student_1.student_user

    assert_does_not_create(Follower) do
      get :student_user_new, section_code: @laurel_section_2.code
    end

    assert_redirected_to '/'
    assert_equal "You've registered for #{@laurel_section_2.name}.", flash[:notice]

    assert_equal [@laurel_student_2.student_user], @laurel_section_1.reload.students # removed from old section
    assert_equal [@laurel_student_1.student_user], @laurel_section_2.reload.students # added to new section
  end

  test "student user new with existing user with messed up email" do
    # use update_attribute to bypass validations
    @student.update_attribute(:email, '')
    @student.update_attribute(:hashed_email, '')

    sign_in @student
    assert_creates(Follower) do
      get :student_user_new, section_code: @chris_section.code
    end

    assert_redirected_to '/'
    assert_equal "You've registered for #{@chris_section.name}.", flash[:notice]

    follower = Follower.last
    assert_equal @student, follower.student_user
    assert_equal @chris, follower.user
    assert_equal @chris_section, follower.section
  end

  test "student_user_new does not allow joining your own section" do
    sign_in @chris

    assert_does_not_create(Follower) do
      get :student_user_new, section_code: @chris_section.code
    end

    assert_redirected_to '/'
    assert_equal "Sorry, you can't join your own section.", flash[:alert]
  end

  test "student_register as teacher" do
    sign_out @laurel

    student_params = {email: 'teacher@school.edu',
                      name: "A name",
                      password: "apassword",
                      gender: 'F',
                      age: '13'}

    assert_creates(User, Follower) do
      post :student_register, section_code: @chris_section.code, user: student_params
    end

    assert_redirected_to '/'

    assert_equal 'A name', assigns(:user).name
    assert_equal 'F', assigns(:user).gender
    assert_equal Time.zone.now.to_date - 13.years, assigns(:user).birthday
    assert_equal nil, assigns(:user).provider
    assert_equal User::TYPE_STUDENT, assigns(:user).user_type
  end

  test "student_register with age and email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {email: 'student1@school.edu',
                        name: "A name",
                        password: "apassword",
                        gender: 'F',
                        age: '13'}

      assert_creates(User, Follower) do
        post :student_register, section_code: @chris_section.code, user: student_params
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 13.years, assigns(:user).birthday
      assert_equal nil, assigns(:user).provider
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
    end
  end

  test "student_register with age and hashed email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      student_params = {hashed_email: Digest::MD5.hexdigest('studentx@school.edu'),
                        name: "A name",
                        password: "apassword",
                        gender: 'F',
                        age: '11'}

      assert_creates(User, Follower) do
        post :student_register, section_code: @chris_section.code, user: student_params
      end

      assert_redirected_to '/'

      assert_equal 'A name', assigns(:user).name
      assert_equal 'F', assigns(:user).gender
      assert_equal Date.today - 11.years, assigns(:user).birthday
      assert_equal nil, assigns(:user).provider
      assert_equal '', assigns(:user).email
      assert_equal Digest::MD5.hexdigest('studentx@school.edu'), assigns(:user).hashed_email
      assert_equal User::TYPE_STUDENT, assigns(:user).user_type
    end
  end

  test "create with section code" do
    sign_in @student

    assert_creates(Follower) do
      post :create, section_code: @laurel_section_1.code, redirect: '/'
    end

    follower = Follower.last

    assert_equal @laurel_section_1, follower.section
    assert_equal @laurel, follower.user
    assert_equal @student, follower.student_user

    assert_redirected_to '/'
    assert_equal "#{@laurel.name} added as your teacher", flash[:notice]
  end

  test "create when already followed by a teacher switches sections" do
    sign_in @laurel_student_1.student_user

    assert_does_not_create(Follower) do
      post :create, section_code: @laurel_section_2.code, redirect: '/'
    end

    assert_redirected_to '/'
    assert_equal "#{@laurel.name} added as your teacher", flash[:notice]

    assert_equal [@laurel_student_2.student_user], @laurel_section_1.reload.students # removed from old section
    assert_equal [@laurel_student_1.student_user], @laurel_section_2.reload.students # added to new section
  end

  test "create does not allow joining your own section" do
    sign_in @chris

    assert_does_not_create(Follower) do
      post :create, section_code: @chris_section.code, redirect: '/'
    end

    assert_redirected_to '/'
    assert_equal "Sorry, you can't join your own section.", flash[:alert]
  end

  test "create with invalid section code gives error message" do
    sign_in @student

    assert_does_not_create(Follower) do
      post :create, section_code: '2323232', redirect: '/'
    end

    assert_redirected_to '/'
    assert_equal "Could not find a section with code '2323232'.", flash[:alert]
  end

  test "create without section code redirects to join" do
    sign_in @student

    assert_does_not_create(Follower) do
      post :create, redirect: '/'
    end

    assert_response :redirect
    assert_redirected_to '/join'
  end

  test "remove has nice error when student does not actually have teacher" do
    sign_in @laurel

    assert_no_difference('Follower.count') do
      post :remove, teacher_user_id: @chris.id
    end
    assert_redirected_to '/'
    assert_equal "The teacher could not be found.", flash[:alert]
  end

  test "student can remove teacher" do
    follower = @laurel_student_1

    sign_in follower.student_user

    assert_difference('Follower.count', -1) do
      post :remove, teacher_user_id: follower.user_id
    end

    assert !Follower.exists?(follower.id)
  end

  test "student can remove teacher if teacher does not have email" do
    follower = @laurel_student_1
    @laurel.update_attribute(:email, "")

    sign_in follower.student_user

    assert_difference('Follower.count', -1) do
      post :remove, teacher_user_id: follower.user_id
    end

    assert !Follower.exists?(follower.id)
  end

  test "student_user_new when signed in in section with script" do
    sign_in @student

    assert_creates(Follower, UserScript) do
      get :student_user_new, section_code: @laurel_section_script.code
    end

    user_script = UserScript.where(user: @student, script: @laurel_section_script.script).first
    assert user_script
    assert user_script.assigned_at
    assert_equal @laurel_section_script.script, @student.primary_script
  end

  test "student_register in section with script" do
    student_params = {email: 'student1@school.edu',
                      name: "A name",
                      password: "apassword",
                      gender: 'F',
                      age: '13'}

    assert_creates(User, Follower, UserScript) do
      post :student_register, section_code: @laurel_section_script.code, user: student_params
    end

    user_script = UserScript.where(user: assigns(:user), script: @laurel_section_script.script).first
    assert user_script
    assert user_script.assigned_at
    assert_equal @laurel_section_script.script, assigns(:user).primary_script
  end

  test "create with section with script" do
    sign_in @student

    assert_creates(Follower, UserScript) do
      post :create, section_code: @laurel_section_script.code, redirect: '/'
    end

    user_script = UserScript.where(user: @student, script: @laurel_section_script.script).first
    assert user_script
    assert user_script.assigned_at
    assert_equal @laurel_section_script.script, @student.primary_script
  end
end
