require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/edit
  #
  class EditTest < ActionDispatch::IntegrationTest
    test 'serializes true account settings flags as data attribute values' do
      student = create(:student, parent_email: 'parent@example.com')
      sign_in student

      get users_edit_path

      assert_response :success
      assert_select "#delete-account[data-can-delete='true']", 1
      assert_select "#add-parent-email[data-has-parent-email='true']", 1
    end

    test 'serializes false account settings flags as data attribute values' do
      student = create(:student_in_picture_section)
      sign_in student

      get users_edit_path

      assert_response :success
      assert_select "#delete-account[data-can-delete='false']", 1
      assert_select "#add-parent-email[data-has-parent-email='false']", 1
    end
  end
end
