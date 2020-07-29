require 'test_helper'

class GdprDialogHelperTest < ActionView::TestCase
  setup do
    @user = build :user

    @request = ActionDispatch::Request.new({})
    @request.stubs(:gdpr?).returns(false)
    @request.stubs(:params).returns({})
  end

  test 'do not show GDPR dialog if no conditions met' do
    refute GdprDialogHelper.show?(@user, @request)
  end

  test 'do not show GDPR dialog if user has accepted data transfer agreement' do
    @user.data_transfer_agreement_accepted = true

    refute GdprDialogHelper.show?(@user, @request)
  end

  test 'show GDPR dialog if force show in params' do
    @request.stubs(:params).returns({'force_in_eu' => 'true'})

    assert GdprDialogHelper.show?(@user, @request)
  end

  test 'show GDPR dialog if in GDPR country' do
    @request.stubs(:gdpr?).returns(true)

    assert GdprDialogHelper.show?(@user, @request)
  end
end
