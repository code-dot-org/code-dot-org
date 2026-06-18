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

  test 'tour start creates a record with started_at and properties' do
    teacher = create(:teacher)
    sign_in teacher

    assert_difference 'UserProductTour.count', 1 do
      post '/dashboardapi/v1/user_product_tours',
        params: {
          tour_name: UserProductTour::VIEW_SYLLABUS,
          started_at: true,
          properties: {demo_type: 'elementary'}
        }, as: :json
    end

    assert_response :ok
    record = UserProductTour.find_by!(user: teacher, tour_name: UserProductTour::VIEW_SYLLABUS)
    refute_nil record.started_at
    assert_nil record.completed_at
    assert_equal 'elementary', record.properties['demo_type']
  end

  test 'repeat tour start is idempotent and returns 200' do
    teacher = create(:teacher)
    sign_in teacher
    UserProductTour.create!(
      user: teacher,
      tour_name: UserProductTour::VIEW_SYLLABUS,
      started_at: Time.now.utc
    )

    assert_no_difference 'UserProductTour.count' do
      post '/dashboardapi/v1/user_product_tours',
        params: {
          tour_name: UserProductTour::VIEW_SYLLABUS,
          started_at: true,
          properties: {demo_type: 'high'}
        }, as: :json
    end

    assert_response :ok
  end

  test 'completion after start sets completed_at' do
    teacher = create(:teacher)
    sign_in teacher
    UserProductTour.create!(
      user: teacher,
      tour_name: UserProductTour::CREATE_CLASS_SECTION,
      started_at: Time.now.utc
    )

    assert_no_difference 'UserProductTour.count' do
      post '/dashboardapi/v1/user_product_tours',
        params: {tour_name: UserProductTour::CREATE_CLASS_SECTION}, as: :json
    end

    assert_response :ok
    record = UserProductTour.find_by!(user: teacher, tour_name: UserProductTour::CREATE_CLASS_SECTION)
    refute_nil record.completed_at
  end

  test 'all valid tour names are accepted' do
    teacher = create(:teacher)
    sign_in teacher

    UserProductTour::VALID_TOUR_NAMES.each do |tour_name|
      post '/dashboardapi/v1/user_product_tours',
        params: {tour_name: tour_name, started_at: true, properties: {demo_type: 'middle'}}, as: :json
      assert_response :ok, "Expected 200 for tour_name=#{tour_name}"
    end
  end
end
