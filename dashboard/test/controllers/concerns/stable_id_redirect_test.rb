require 'test_helper'

class StableIdRedirectTest < ActionDispatch::IntegrationTest
  VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

  describe 'redirect_to_code_org' do
    it 'appends statsig_stable_id when cookie is present and valid' do
      cookies[:statsig_stable_id] = VALID_UUID
      get '/courses'
      assert_response :redirect
      assert_includes response.location, "statsig_stable_id=#{VALID_UUID}"
    end

    it 'does not append param when cookie is absent' do
      get '/courses'
      assert_response :redirect
      refute_includes response.location, 'statsig_stable_id'
    end

    it 'does not append param when cookie value is invalid' do
      cookies[:statsig_stable_id] = 'not-a-valid-uuid'
      get '/courses'
      assert_response :redirect
      refute_includes response.location, 'statsig_stable_id'
    end
  end
end
