require 'test_helper'

class Api::V1::TeachingProfileDataControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:teacher)
    sign_in @user
  end

  test 'creates new teaching profile data via POST' do
    personalization_data = {
      selectedGoals: ['Become more confident in teaching new concepts'],
      selectedSupports: ['Interactive examples or practice activities (hands-on)'],
      otherSupportText: '',
      otherGoalText: '',
      selectedConfidence: 3,
      yearsTeaching: 5,
      dateYearsTeachingSet: '2025-09-17T10:00:00.000Z',
      classroomVision: 'A collaborative and engaging environment',
      challenge: 'Keeping up with technology changes'
    }

    assert_difference 'TeachingProfileData.count', 1 do
      post '/dashboardapi/v1/teaching_profile_data',
           params: {teaching_profile_data: {individual_data: personalization_data}},
           as: :json
    end

    assert_response :created
    response_data = JSON.parse(response.body)
    assert_equal true, response_data['success']
    assert_equal 'created', response_data['action']

    teaching_profile_data = TeachingProfileData.find_by(user: @user)
    refute_nil teaching_profile_data
    assert_equal personalization_data.stringify_keys, teaching_profile_data.individual_data
  end

  test 'updates existing teaching profile data via PATCH' do
    existing_data = {
      selectedGoals: ['Old goal'],
      yearsTeaching: 2,
      selectedConfidence: 2
    }
    teaching_profile_data = TeachingProfileData.create(user: @user, individual_data: existing_data)

    new_data = {
      selectedGoals: ['Become more confident in teaching new concepts'],
      selectedSupports: ['Interactive examples or practice activities (hands-on)'],
      selectedConfidence: 4,
      yearsTeaching: 3,
      classroomVision: 'Updated classroom vision'
    }

    assert_no_difference 'TeachingProfileData.count' do
      patch '/dashboardapi/v1/teaching_profile_data',
            params: {teaching_profile_data: {individual_data: new_data}},
            as: :json
    end

    assert_response :success
    response_data = JSON.parse(response.body)
    assert_equal true, response_data['success']
    assert_equal 'updated', response_data['action']

    teaching_profile_data.reload
    assert_equal new_data.stringify_keys, teaching_profile_data.individual_data
  end

  test 'shows existing teaching profile data via GET' do
    existing_data = {
      selectedGoals: ['Existing goal'],
      yearsTeaching: 5,
      selectedConfidence: 4
    }
    TeachingProfileData.create(user: @user, individual_data: existing_data)

    get '/dashboardapi/v1/teaching_profile_data'

    assert_response :success
    response_data = JSON.parse(response.body)
    assert_equal true, response_data['exists']
    assert_equal existing_data.stringify_keys, response_data['data']
  end

  test 'shows non-existence for user without teaching profile data via GET' do
    get '/dashboardapi/v1/teaching_profile_data'

    assert_response :success
    response_data = JSON.parse(response.body)
    assert_equal false, response_data['exists']
    assert_nil response_data['data']
  end

  test 'returns 404 when trying to update non-existent data' do
    new_data = {selectedGoals: ['New goal']}

    patch '/dashboardapi/v1/teaching_profile_data',
          params: {teaching_profile_data: {individual_data: new_data}},
          as: :json

    assert_response :not_found
    response_data = JSON.parse(response.body)
    assert_equal false, response_data['success']
    assert_includes response_data['errors'], 'No teaching profile data found to update. Please create data first.'
  end

  test 'handles validation errors during creation' do
    # Mock the TeachingProfileData to simulate validation failure
    TeachingProfileData.any_instance.stubs(:save).returns(false)
    TeachingProfileData.any_instance.stubs(:errors).returns(
      double(full_messages: ['Validation failed'])
    )

    post '/dashboardapi/v1/teaching_profile_data',
         params: {teaching_profile_data: {individual_data: {}}},
         as: :json

    assert_response :unprocessable_entity
    response_data = JSON.parse(response.body)
    assert_equal false, response_data['success']
    assert_includes response_data['errors'], 'Validation failed'
  end

  test 'handles validation errors during update' do
    # Mock the update to fail
    TeachingProfileData.any_instance.stubs(:update).returns(false)
    TeachingProfileData.any_instance.stubs(:errors).returns(
      double(full_messages: ['Update validation failed'])
    )

    new_data = {selectedGoals: ['New goal']}

    patch '/dashboardapi/v1/teaching_profile_data',
          params: {teaching_profile_data: {individual_data: new_data}},
          as: :json

    assert_response :unprocessable_entity
    response_data = JSON.parse(response.body)
    assert_equal false, response_data['success']
    assert_includes response_data['errors'], 'Update validation failed'
  end

  test 'requires authentication for create' do
    sign_out @user

    post '/dashboardapi/v1/teaching_profile_data',
         params: {teaching_profile_data: {individual_data: {}}},
         as: :json

    assert_response :unauthorized
  end

  test 'requires authentication for update' do
    sign_out @user

    patch '/dashboardapi/v1/teaching_profile_data',
          params: {teaching_profile_data: {individual_data: {}}},
          as: :json

    assert_response :unauthorized
  end

  test 'requires authentication for show' do
    sign_out @user

    get '/dashboardapi/v1/teaching_profile_data'

    assert_response :unauthorized
  end
end
