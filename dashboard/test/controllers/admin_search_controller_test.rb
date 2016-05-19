require 'test_helper'

class AdminSearchControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')

    @teacher = create(:teacher)
    @teacher_section = create(:section, :user => @teacher)
  end

  # Confirm the permissioning on these pages is admin-only.
  generate_admin_only_tests_for :find_students
  generate_admin_only_tests_for :lookup_section
  generate_admin_only_tests_for :search_for_teachers

  #
  # lookup_section tests
  #

  test "should lookup_section" do
    post :lookup_section, {:section_code => @teacher_section.code}
    assert_select '#section_owner', 'Owner: ' + @teacher.email
  end

  test "should lookup_section error if not found" do
    post :lookup_section, {:section_code => 'ZZZZ'}
    assert_response :success
    assert_select '.container .alert-danger', 'Section code not found'
  end

  test "should not lookup_section if not admin" do
    sign_in @not_admin
    post :lookup_section, {:section_code => @teacher_section.code}
    assert_response :forbidden
  end

  test "should not lookup_section if not signed in" do
    sign_out @admin
    post :lookup_section, {:section_code => @teacher_section.code}
    assert_redirected_to_sign_in
  end
end
