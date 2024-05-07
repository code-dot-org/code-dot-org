require 'test_helper'

class Services::Lti::AccountLinkerTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @session = {}
  end

  test 'reassigns an auth option from a partial registration to an existing user' do
    partial_lti_teacher = build :teacher
    partial_lti_teacher.authentication_options << build(:lti_authentication_option)
    PartialRegistration.persist_attributes @session, partial_lti_teacher
    assert_equal 1, @user.authentication_options.count
    refute Policies::Lti.lti?(@user)

    Services::Lti::AccountLinker.call(user: @user, session: @session)
    assert_equal 2, @user.reload.authentication_options.count
    assert Policies::Lti.lti?(@user)
  end
end
