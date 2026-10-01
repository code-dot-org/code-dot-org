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

    test 'lists one ClassLink row when the user holds both v1 and v2 ClassLink options' do
      teacher = create(:teacher, :with_classlink_authentication_option)
      v2_option = create(
        :authentication_option,
        user: teacher,
        email: teacher.email,
        hashed_email: teacher.hashed_email,
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: 'tenant|sourced',
        version: AuthenticationOption::Classlink::VERSION[:v2]
      )
      sign_in teacher

      get users_edit_path

      assert_response :success
      script = css_select('script[data-edit]').first
      options = JSON.parse(script['data-edit'])['authenticationOptions']
      classlink_options = options.select {|option| option['credential_type'] == AuthenticationOption::CLASSLINK}
      assert_equal [v2_option.id], classlink_options.pluck('id')
    end
  end
end
