require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/upgrade
  #
  class UpgradeTest < ActionDispatch::IntegrationTest
    NEW_EMAIL = 'upgraded@code.org'
    NEW_PASSWORD = '1234567'

    #
    # Tests for migrated users
    #

    test 'upgrade migrated word student to password without secret words fails' do
      student_without_password = create :student_in_word_section
      assert_empty student_without_password.hashed_email
      sign_in student_without_password

      user_params = {
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD
      }
      patch '/users/upgrade', params: {
        user: user_params
      }
      assert_response :success # Which is a failure!

      student_without_password.reload
      refute_equal User.hash_email(NEW_EMAIL), student_without_password.hashed_email
      refute student_without_password.valid_password? NEW_PASSWORD
      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?
    end

    test 'upgrade migrated word student to password with secret words succeeds' do
      student_without_password = create :student_in_word_section
      assert_empty student_without_password.hashed_email
      sign_in student_without_password

      user_params = {
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD,
        secret_words: student_without_password.secret_words
      }
      patch '/users/upgrade', params: {
        user: user_params
      }
      assert_redirected_to '/users/edit'

      student_without_password.reload
      assert_equal User.hash_email(NEW_EMAIL), student_without_password.hashed_email
      assert student_without_password.valid_password? NEW_PASSWORD
      refute student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?
    end

    test 'upgrade migrated picture student to password succeeds' do
      student_without_password = create :student_in_picture_section
      assert_empty student_without_password.hashed_email
      sign_in student_without_password

      user_params = {
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD,
      }
      patch '/users/upgrade', params: {
        user: user_params
      }
      assert_redirected_to '/users/edit'

      student_without_password.reload
      assert_equal User.hash_email(NEW_EMAIL), student_without_password.hashed_email
      assert student_without_password.valid_password? NEW_PASSWORD
      refute student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?
    end

    test 'upgrade migrated student to password account with parent email succeeds and sends email' do
      student_without_password = create :student_in_picture_section
      assert_empty student_without_password.hashed_email
      sign_in student_without_password

      parent_email = 'upgraded_parent@code.org'
      new_username = 'upgrade_username'

      user_params = {
        parent_email: parent_email,
        username: new_username,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD,
      }
      patch '/users/upgrade', params: {
        user: user_params
      }
      assert_redirected_to '/users/edit'

      student_without_password.reload
      assert_equal parent_email, student_without_password.parent_email
      assert_equal new_username, student_without_password.username
      assert student_without_password.valid_password? NEW_PASSWORD
      refute student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?

      mail = ActionMailer::Base.deliveries.first
      assert_equal [parent_email], mail.to
      assert_equal 'Login information for Code.org', mail.subject
      assert mail.body.to_s =~ /Your child/
    end

    test 'upgrade migrated student to password account with malformed parent email fails and does not send email' do
      student_without_password = create :student_in_picture_section
      assert_empty student_without_password.hashed_email
      sign_in student_without_password

      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?

      new_username = 'upgrade_username'

      user_params = {
        parent_email: 'malformed@code',
        username: new_username,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD,
      }
      patch '/users/upgrade', params: {
        user: user_params
      }
      assert_response :success # Which is a failure!

      # Verify nothing changed
      student_without_password.reload
      refute_equal new_username, student_without_password.username
      refute student_without_password.valid_password? NEW_PASSWORD
      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?

      # No email was sent
      assert_nil ActionMailer::Base.deliveries.first
    end
  end
end
