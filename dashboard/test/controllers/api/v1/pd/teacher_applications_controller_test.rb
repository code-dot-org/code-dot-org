require 'test_helper'

class Api::V1::Pd::TeacherApplicationsControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @school_district = create :school_district
    @school = create :public_school

    @teacher = create :teacher
    @test_params = {
      application: build(:pd_teacher_application_hash, user: @teacher)
    }
  end

  setup do
    SchoolDistrict.stubs(find: @school_district)
    School.stubs(find: @school)
  end

  test 'logged in teachers can create teacher applications' do
    sign_in @teacher

    assert_creates Pd::TeacherApplication do
      put :create, params: @test_params
      assert_response :success
    end
  end

  # For now. Perhaps we'll render a different view explaining how to upgrade to teacher account in the future.
  test 'students can create teacher applications' do
    @teacher.update!(user_type: :student)
    sign_in @teacher

    assert_creates Pd::TeacherApplication do
      put :create, params: @test_params
      assert_response :success
    end
  end

  test_redirect_to_sign_in_for :create, method: :put, params: -> {@test_params}

  test 'admins can index teacher applications' do
    5.times do
      create :pd_teacher_application
    end

    sign_in create(:workshop_admin)
    get :index
    assert_response :success

    response = JSON.parse(@response.body)
    assert_equal 5, response.count
  end

  test 'non admins with valid key can index teacher application' do
    secret_key = SecureRandom.hex(10)
    CDO.stubs(pd_teacher_application_list_secret_key: secret_key)
    get :index, params: {secret_key: secret_key}
    assert_response :success
  end

  test 'index for non admins without a valid key returns 404' do
    secret_key = SecureRandom.hex(10)
    CDO.stubs(pd_teacher_application_list_secret_key: secret_key)
    get :index, params: {secret_key: 'invalid'}
    assert_response 404
  end

  test_user_gets_response_for :index, user: :teacher, response: :not_found

  test 'strip_utf8mb4' do
    sign_in @teacher

    application_hash = build(:pd_teacher_application_hash, user: @teacher)
    application_hash['whyCsIsImportant'] = "My favorite emoji, the #{panda_panda}, would not be possible without CS"
    application_hash['subjects2017'] = ['Math', "#{panda_panda} training"]

    assert_creates Pd::TeacherApplication do
      put :create, params: {application: application_hash}
      assert_response :success
    end

    result_hash = Pd::TeacherApplication.last.application_hash
    assert_equal 'My favorite emoji, the Panda, would not be possible without CS', result_hash['whyCsIsImportant']
    assert_equal ['Math', 'Panda training'], result_hash['subjects2017']
  end

  test 'multiple submissions ignores the first ones' do
    sign_in @teacher

    assert_creates Pd::TeacherApplication do
      put :create, params: @test_params
      assert_response :success
    end

    assert_no_difference 'Pd::TeacherApplication.count' do
      put :create, params: @test_params
      assert_response :success
    end
  end

  test 'submit is idempotent' do
    create :pd_teacher1819_application, user: @teacher

    sign_in @teacher
    assert_no_difference 'Pd::Application::Teacher1819Application.count' do
      put :create, params: @test_params
    end
    assert_response :success
  end
end
