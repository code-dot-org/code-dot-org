require 'test_helper'

class PairingsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
  end

  test 'should get show for logged in user' do
    sign_in create(:user)
    get :show
    assert_response :success
  end

end
