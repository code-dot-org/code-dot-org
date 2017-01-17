require 'test_helper'

class Api::V1::Pd::TeacherApplicationsControllerTest < ::ActionController::TestCase
  setup do
    @school_district = create :school_district
    SchoolDistrict.stubs(find: @school_district)

    @school = create :public_school
    School.stubs(find: @school)
  end

  test 'logged in teachers can create teacher applications' do
    sign_in create(:teacher)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params

      assert_response :success
    end
  end

  # For now. Perhaps we'll render a different view explaining how to upgrade to teacher account in the future.
  test 'students can create teacher applications' do
    sign_in create(:student)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params
      assert_response :success
    end
  end

  test 'not logged in users are redirected to sign in' do
    put :create, params: test_params
    assert_redirected_to_sign_in
  end

  test 'admins can index teacher applications' do
    5.times do
      create :pd_teacher_application
    end

    sign_in create(:admin)
    get :index
    assert_response :success

    response = JSON.parse(@response.body)
    assert_equal 5, response.count
  end

  test 'non admins with valid key can index teacher application' do
    secret_key = SecureRandom.hex(10)
    CDO.stubs(pd_teacher_application_list_secret_key: secret_key)
    get :index, secret_key: secret_key
    assert_response :success
  end

  test 'index for non admins without a valid key returns 404' do
    secret_key = SecureRandom.hex(10)
    CDO.stubs(pd_teacher_application_list_secret_key: secret_key)
    get :index, secret_key: 'invalid'
    assert_response 404
  end

  test 'index for non admins with no key returns 404' do
    sign_in create(:teacher)
    get :index
    assert_response 404
  end

  test 'strip_utf8mb4' do
    sign_in create(:teacher)

    application_hash = build(:pd_teacher_application_hash)
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
    sign_in create(:teacher)

    assert_creates Pd::TeacherApplication do
      put :create, params: test_params

      assert_response :success
    end

    assert_no_difference 'Pd::TeacherApplication.count' do
      put :create, params: test_params

      assert_response :success
    end
  end

  private

  def test_params
    {
      application: build(:pd_teacher_application_hash)
    }
  end
end
