require 'test_helper'

class Api::V1::UserProductToursControllerTest < ActionDispatch::IntegrationTest
  test 'unauthenticated request returns 401' do
    post '/dashboardapi/v1/user_product_tours',
      params: {tour_name: UserProductTour::CREATE_CLASS_SECTION}, as: :json

    assert_response :unauthorized
  end

  test 'first-time completion creates a record and returns 200' do
    teacher = create(:teacher)
    sign_in teacher

    assert_difference 'UserProductTour.count', 1 do
      post '/dashboardapi/v1/user_product_tours',
        params: {tour_name: UserProductTour::CREATE_CLASS_SECTION}, as: :json
    end

    assert_response :ok
    record = UserProductTour.find_by!(user: teacher, tour_name: UserProductTour::CREATE_CLASS_SECTION)
    refute_nil record.completed_at
  end

  test 'repeat completion is idempotent and returns 200' do
    teacher = create(:teacher)
    sign_in teacher
    UserProductTour.create!(user: teacher, tour_name: UserProductTour::CREATE_CLASS_SECTION, completed_at: Time.now.utc)

    assert_no_difference 'UserProductTour.count' do
      post '/dashboardapi/v1/user_product_tours',
        params: {tour_name: UserProductTour::CREATE_CLASS_SECTION}, as: :json
    end

    assert_response :ok
  end

  test 'invalid tour name returns 422' do
    sign_in create(:teacher)

    post '/dashboardapi/v1/user_product_tours',
      params: {tour_name: 'not_a_real_tour'}, as: :json

    assert_response :unprocessable_entity
  end
end
