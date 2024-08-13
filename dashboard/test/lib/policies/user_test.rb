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
end
