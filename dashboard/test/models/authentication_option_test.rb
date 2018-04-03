require 'test_helper'

class AuthenticationOptionTest < ActiveSupport::TestCase
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
end
