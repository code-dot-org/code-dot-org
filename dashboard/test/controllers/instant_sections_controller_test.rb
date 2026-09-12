require 'test_helper'

class InstantSectionsControllerTest < ActionController::TestCase
  setup do
    @section = create(:section, login_type: Section::LOGIN_TYPE_WORD, instant_section: true)
    Cdo::Throttle.stubs(:throttle).returns(false)
  end

  test 'lookup normalizes the code and does not expose roster or create an account' do
    assert_no_difference ['User.count', 'Follower.count'] do
      get :show, params: {section_code: " #{@section.code.downcase} "}
    end
    assert_response :success
    assert_equal({'code' => @section.code}, JSON.parse(response.body))
  end

  test 'join creates and signs in a sponsored student with reusable secrets' do
    assert_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: @section.code, name: ' Alex ', user_type: 'teacher', provider: 'email', admin: true}
    end
    assert_response :created
    student = @section.students.sole
    assert_equal 'Alex', student.name
    assert student.student?
    refute student.admin?
    assert student.teacher_managed_account?
    assert student.secret_picture
    assert student.secret_words.present?
    assert_equal student, @controller.current_user
    assert_equal student, User.authenticate_with_section_and_secret_words(section: @section, params: {user_id: student.id, secret_words: student.secret_words})
    assert_equal root_path, JSON.parse(response.body)['redirect_url']
  end

  test 'a repeated name creates a separate student instead of signing into an existing account' do
    existing = create(:student, name: 'Alex')
    @section.add_student(existing)

    assert_difference 'User.count' do
      post :join, params: {section_code: @section.code, name: 'Alex'}
    end
    assert_response :created
    refute_equal existing, @controller.current_user
    assert_equal 2, @section.students.count
  end

  test 'joining honors section sharing restrictions' do
    @section.update!(sharing_disabled: true)
    post :join, params: {section_code: @section.code, name: 'Alex'}
    assert_response :created
    assert @section.students.sole.sharing_disabled
  end

  test 'signed in users must use the existing join flow' do
    student = create(:student)
    sign_in student
    assert_no_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: @section.code, name: 'Alex'}
    end
    assert_response :conflict
    assert_equal student, @controller.current_user
  end

  ['', '   ', 'a' * 71].each do |name|
    test "invalid name #{name.inspect} creates neither an account nor a roster entry" do
      assert_no_difference ['User.count', 'Follower.count'] do
        post :join, params: {section_code: @section.code, name: name}
      end
      assert_response :unprocessable_entity
      assert_nil @controller.current_user
    end
  end

  test 'failed enrollment rolls back account creation' do
    Section.any_instance.stubs(:add_student).returns(Section::ADD_STUDENT_FAILURE)
    assert_no_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: @section.code, name: 'Alex'}
    end
    assert_response :not_found
    assert_nil @controller.current_user
  end

  {
    ordinary_word_section: {instant_section: false},
    restricted_section: {restrict_section: true},
    archived_section: {hidden: true},
    changed_login_type: {login_type: Section::LOGIN_TYPE_EMAIL},
  }.each do |label, attributes|
    test "#{label} cannot be looked up or joined" do
      @section.update!(attributes)
      assert_unavailable
    end
  end

  test 'deleted sections cannot be joined' do
    @section.destroy!
    assert_unavailable
  end

  test 'sections with deleted teachers cannot be joined' do
    @section.user.destroy!
    assert_unavailable
  end

  test 'sections with student owners cannot be joined' do
    @section.user.update!(user_type: User::TYPE_STUDENT)
    assert_unavailable
  end

  test 'full sections cannot be joined' do
    Section.any_instance.stubs(:at_capacity?).returns(true)
    assert_unavailable
  end

  test 'invalid codes cannot be joined' do
    assert_no_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: 'invalid', name: 'Alex'}
    end
    assert_response :not_found
  end

  test 'throttled requests cannot create accounts' do
    Cdo::Throttle.stubs(:throttle).returns(true)
    assert_no_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: @section.code, name: 'Alex'}
    end
    assert_response :too_many_requests
  end

  private def assert_unavailable
    get :show, params: {section_code: @section.code}
    assert_response :not_found
    assert_no_difference ['User.count', 'Follower.count'] do
      post :join, params: {section_code: @section.code, name: 'Alex'}
    end
    assert_response :not_found
    assert_nil @controller.current_user
  end
end
