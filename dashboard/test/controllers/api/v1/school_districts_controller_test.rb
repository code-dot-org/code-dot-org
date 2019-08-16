require 'test_helper'

class Api::V1::SchoolDistrictsControllerTest < ActionController::TestCase
  LOWER_KUSKOKWIM_SCHOOL_DISTRICT = {
    nces_id: '200001',
    name: 'Lower Kuskokwim School District',
    city: 'Bethel',
    state: 'AK',
    zip: '99559'
  }.deep_stringify_keys.freeze

  LOWER_YUKON_SCHOOL_DISTRICT = {
    nces_id: '200003',
    name: 'Lower Yukon School District',
    city: 'Mountain Village',
    state: 'AK',
    zip: '99632'
  }.deep_stringify_keys.freeze

  test 'search by school name prefix' do
    get :search, params: {q: 'lowe', limit: 40}
    assert_response :success
    assert_equal [LOWER_KUSKOKWIM_SCHOOL_DISTRICT, LOWER_YUKON_SCHOOL_DISTRICT], JSON.parse(@response.body)
  end

  test 'search by word within' do
    get :search, params: {q: 'yukon', limit: 40}
    assert_response :success
    assert_equal [LOWER_YUKON_SCHOOL_DISTRICT], JSON.parse(@response.body)
  end

  test 'search by school city prefix' do
    get :search, params: {q: 'beth', limit: 40}
    assert_response :success
    assert_equal [LOWER_KUSKOKWIM_SCHOOL_DISTRICT], JSON.parse(@response.body)
  end
end
