require 'test_helper'

class PairingsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
  end

  test 'should get admin progress page' do
    get :admin_progress
    assert_select 'h1', 'Admin progress'
  end

end
