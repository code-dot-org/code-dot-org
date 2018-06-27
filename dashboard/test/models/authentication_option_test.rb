require 'test_helper'

class AuthenticationOptionTest < ActiveSupport::TestCase
  test 'migrated user email and hashed email look at authentication_options' do
    original_teacher_email = 'testteacher@xyz.foo'
    new_teacher_email = 'awesometeacher@xyz.foo'
    teacher = create(:teacher, email: original_teacher_email)
    email_auth = create(:email_authentication_option, user: teacher, email: new_teacher_email)
    teacher.update(primary_authentication_option: email_auth, provider: 'migrated')
    assert_equal teacher.primary_authentication_option_id, email_auth.id
    assert_equal new_teacher_email, teacher.email
    assert_equal AuthenticationOption.hash_email(new_teacher_email), teacher.hashed_email
  end

  test 'email is properly sanitized and hashed' do
    teacher_email = 'TESTcaseSANITIZATION@test.com'
    sanitized = 'testcasesanitization@test.com'
    teacher = create(:teacher, email: teacher_email)
    email_auth = create(:email_authentication_option, user: teacher, email: teacher_email)
    assert_equal sanitized, email_auth.email
    assert_equal email_auth.hashed_email, AuthenticationOption.hash_email(sanitized)
  end

  test 'student email is not stored but hashed_email is' do
    student_email = 'teststudent@test.com'
    student = create(:student, email: student_email)
    email_auth = create(:email_authentication_option, user: student, email: student_email)
    assert email_auth.user.student?
    assert_equal '', email_auth.email
    assert_equal student.hashed_email, email_auth.hashed_email
  end

  test 'user can have multiple authentication options' do
    assert_creates(User) do
      user = create(:user, :with_google_authentication_option, :with_clever_authentication_option)
      assert user.authentication_options.length == 2
      assert user.authentication_options.first.hashed_email == user.hashed_email
    end
  end

  test 'student in word section can have no authentication options' do
    user = create(:student_in_word_section)
    assert_empty user.authentication_options
  end

  test 'destroying user destroys authentication options and we can restore them' do
    user = create(:user, :with_google_authentication_option)
    authentication_option_id = user.authentication_options.first.id
    user.destroy
    authentication_option = AuthenticationOption.with_deleted.where(id: authentication_option_id).first
    assert authentication_option.deleted?
    assert user.deleted?
    user.restore(recursive: true)
    refute user.deleted?
    refute user.authentication_options.first.deleted?
  end

  test 'oauth? false when credential_type is email' do
    option = create :authentication_option, credential_type: AuthenticationOption::EMAIL
    refute option.oauth?
  end

  test 'oauth? true when credential_type is Clever' do
    option = create :authentication_option, credential_type: AuthenticationOption::CLEVER
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Facebook' do
    option = create :authentication_option, credential_type: AuthenticationOption::FACEBOOK
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Google' do
    option = create :authentication_option, credential_type: AuthenticationOption::GOOGLE
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Powerschool' do
    option = create :authentication_option, credential_type: AuthenticationOption::POWERSCHOOL
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Quikcamps' do
    option = create :authentication_option, credential_type: AuthenticationOption::QWIKLABS
    assert option.oauth?
  end

  test 'oauth? true when credential_type is The School Project' do
    option = create :authentication_option, credential_type: AuthenticationOption::THE_SCHOOL_PROJECT
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Twitter' do
    option = create :authentication_option, credential_type: AuthenticationOption::TWITTER
    assert option.oauth?
  end

  test 'oauth? true when credential_type is Windows Live' do
    option = create :authentication_option, credential_type: AuthenticationOption::WINDOWS_LIVE
    assert option.oauth?
  end
end
