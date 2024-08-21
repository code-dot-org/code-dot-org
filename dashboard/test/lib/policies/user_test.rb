require 'test_helper'
require 'policies/user'
class Policies::UserTest < ActiveSupport::TestCase
  class UserAttributes < Policies::UserTest
    test 'all default attributes (except email) should be returned' do
      user = create :teacher, :with_google_authentication_option
      attrs = Policies::User.user_attributes(user)

      missing_attrs = []
      user.attributes.compact.each_key do |attr|
        missing_attrs << attr unless attrs.key?(attr) || attr == 'email'
      end

      assert missing_attrs.empty?, "#{missing_attrs} are missing"
    end

    test 'authentication_options should be returned' do
      user = create :teacher, :with_google_authentication_option
      ao_email = user.authentication_options.first.email

      attrs = Policies::User.user_attributes(user)
      attrs_aos = attrs['authentication_options_attributes']

      assert_equal ao_email, attrs_aos[0]['email']
      assert_equal user.authentication_options.count, attrs_aos.count
    end

    test 'remove email from user session value' do
      user = create :teacher

      attrs = Policies::User.user_attributes(user)
      assert_nil attrs['email']
    end
  end

  test 'verified_teacher_candidate? should return true when criteria is met' do
    # Google Authentication Option present, and has non-gmail/non-googlemail email,
    # criteria met
    teacher = create :teacher, :with_google_authentication_option
    assert_equal true, Policies::User.verified_teacher_candidate?(teacher)
  end

  test 'verified_teacher_candidate? should return false when criteria is not met' do
    teacher = create :teacher
    # Google Authentication Option not present, criteria not met
    assert_equal false, Policies::User.verified_teacher_candidate?(teacher)
    # Google Authentication Option has a gmail email, criteria not met
    create :google_authentication_option, user: teacher, email: 'test@gmail.com'
    assert_equal false, Policies::User.verified_teacher_candidate?(teacher)
  end

  test 'verified_teacher_candidate? should return false when teacher is already verified' do
    teacher = create :teacher
    # Change teacher to verified
    teacher.verify_teacher!
    assert_equal true, teacher.verified_teacher?
    # Teacher already verified, not eligible for re-verification
    assert_equal false, Policies::User.verified_teacher_candidate?(teacher)
  end
end
