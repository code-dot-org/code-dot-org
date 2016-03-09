require 'test_helper'

class AdminHocControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    # Stub the DB[:forms] table (used by :hoc_signups).
    DB.stubs(:[]).returns(stub(:where => stub(:group => stub(:group_and_count => stub(:order => stub(:all => []))))))

    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')
  end

  generate_admin_only_tests_for :event_signups
  generate_admin_only_tests_for :students_served
end
