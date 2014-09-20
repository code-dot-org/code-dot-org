require 'test_helper'

class FollowersControllerTest < ActionController::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section_1 = create(:section, user: @laurel)
    @laurel_section_2 = create(:section, user: @laurel)

    # add a few students to a section
    @laurel_student_1 = create(:follower, section: @laurel_section_1)
    @laurel_student_2 = create(:follower, section: @laurel_section_1)

    @chris = create(:teacher)
    @chris_section = create(:section, user: @chris)

    # student without section or teacher
    @student = create(:user)

    sign_in @laurel
  end

  test "index should redirect to new teacher dashboard" do
    get :index
    assert_redirected_to '//test.code.org/teacher-dashboard'
  end

  test "manage should redirect to new teacher dashboard" do
    get :manage
    assert_redirected_to '//test.code.org/teacher-dashboard'
  end

  test "sections should redirect to new teacher dashboard" do
    get :sections
    assert_redirected_to '//test.code.org/teacher-dashboard'
  end

  test "student_user_new" do
    sign_out @laurel

    get :student_user_new, section_code: @chris_section.code

    assert_response :success
    assert assigns(:user)
    
    assert ! assigns(:user).persisted?
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


  test "student_register with age and email" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      sign_out @laurel

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
      sign_out @laurel

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

  test "create with invalid section code gives error message" do
    sign_in @student

    assert_does_not_create(Follower) do
      post :create, section_code: '2323232', redirect: '/'
    end

    assert_redirected_to '/'
    assert_equal "Could not find a section with code '2323232'.", flash[:alert]
  end

  test "create without section code gives error message" do
    sign_in @student

    assert_does_not_create(Follower) do
      post :create, redirect: '/'
    end

    assert_redirected_to '/'
    assert_equal "Please enter a section code", flash[:alert]
  end

  test "student can remove teacher" do
    follower = @laurel_student_1

    sign_in follower.student_user

    assert_difference('Follower.count', -1) do
      post :remove, student_user_id: follower.student_user.id, teacher_user_id: follower.user_id
    end

    assert !Follower.exists?(follower.id)
  end

  test "student can remove teacher if teacher does not have email" do
    follower = @laurel_student_1
    @laurel.update_attribute(:email, "")

    sign_in follower.student_user

    assert_difference('Follower.count', -1) do
      post :remove, student_user_id: follower.student_user.id, teacher_user_id: follower.user_id
    end

    assert !Follower.exists?(follower.id)
  end

  test "teacher can remove student" do
    follower = @laurel_student_1

    sign_in follower.user

    assert_difference('Follower.count', -1) do
      post :remove, student_user_id: follower.student_user_id, teacher_user_id: follower.user_id
    end

    assert !Follower.exists?(follower.id)
  end

  test "student cannot remove other student" do
    follower = @laurel_student_1

    sign_in @student

    assert_no_difference('Follower.count') do
      post :remove, student_user_id: follower.student_user_id, teacher_user_id: follower.user_id
    end
    assert_response :forbidden
    assert follower.reload # not deleted
  end

end
