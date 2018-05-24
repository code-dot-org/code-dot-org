# -*- coding: utf-8 -*-
require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/upgrade
  #
  class UpgradeTest < ActionDispatch::IntegrationTest
    test 'upgrade word student to password without secret words fails' do
      student_without_password = create(:student_in_word_section)
      sign_in student_without_password

      user_params = {
        email: 'upgraded@code.org',
        password: '1234567',
        password_confirmation: '1234567'
      }

      patch '/users/upgrade', params: {
        user: user_params
      }

      student_without_password.reload
      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?
    end

    test 'upgrade word student to password with secret words succeeds' do
      student_without_password = create(:student_in_word_section)
      sign_in student_without_password

      user_params = {
        email: 'upgraded@code.org',
        password: '1234567',
        password_confirmation: '1234567',
        secret_words: student_without_password.secret_words
      }
      patch '/users/upgrade', params: {
        user: user_params
      }

      student_without_password.reload
      refute student_without_password.teacher_managed_account?
      assert student_without_password.provider.nil?
    end

    test 'upgrade picture student to password succeeds' do
      student_without_password = create(:student_in_picture_section)
      sign_in student_without_password

      user_params = {
        email: 'upgraded@code.org',
        password: '1234567',
        password_confirmation: '1234567',
      }
      patch '/users/upgrade', params: {
        user: user_params
      }

      student_without_password.reload
      refute student_without_password.teacher_managed_account?
      assert student_without_password.provider.nil?
    end

    test 'upgrade student to password account with parent email succeeds and sends email' do
      student_without_password = create(:student_in_picture_section)
      sign_in student_without_password

      parent_email = 'upgraded_parent@code.org'

      user_params = {
        parent_email: parent_email,
        username: 'upgrade_username',
        password: '1234567',
        password_confirmation: '1234567',
      }
      patch '/users/upgrade', params: {
        user: user_params
      }

      student_without_password.reload
      refute student_without_password.teacher_managed_account?
      assert student_without_password.provider.nil?

      mail = ActionMailer::Base.deliveries.first
      assert_equal [parent_email], mail.to
      assert_equal 'Login information for Code.org', mail.subject
      assert mail.body.to_s =~ /Your child/
    end

    test 'upgrade student to password account with malformed parent email fails and does not send email' do
      student_without_password = create(:student_in_picture_section)
      sign_in student_without_password

      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?

      user_params = {
        parent_email: 'malformed@code',
        username: 'upgrade_username',
        password: '1234567',
        password_confirmation: '1234567',
      }
      patch '/users/upgrade', params: {
        user: user_params
      }

      # Verify nothing changed
      student_without_password.reload
      assert student_without_password.teacher_managed_account?
      refute student_without_password.provider.nil?

      # No email was sent
      assert_nil ActionMailer::Base.deliveries.first
    end
  end
end
