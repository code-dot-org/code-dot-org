require 'test_helper'

class CoursesRedirectControllerTest < ActionDispatch::IntegrationTest
  describe 'show' do
    it 'redirects to code.org/students' do
      get '/courses'
      assert_response :redirect
      assert_includes response.location, '/students'
    end
  end
end
