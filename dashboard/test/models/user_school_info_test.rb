require 'test_helper'

class UserSchoolInfoTest < ActiveSupport::TestCase
  test "last confirmation date in user school infos table is updated" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/update_last_confirmation_date/#{user_school_info.user.id}", params: {
      last_confirmation_date: DateTime.now
    }
    assert_response :success
  end
end
