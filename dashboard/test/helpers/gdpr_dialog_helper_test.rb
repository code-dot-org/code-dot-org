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
    accepted_user = build :user, data_transfer_agreement_accepted: true

    refute GdprDialogHelper.show?(accepted_user, @request)
  end

  test 'show GDPR dialog if force show in params' do
    force_eu_request = ActionDispatch::Request.new({})
    force_eu_request.stubs(:gdpr?).returns(false)
    force_eu_request.stubs(:params).returns({'force_in_eu' => 'true'})

    assert GdprDialogHelper.show?(@user, force_eu_request)
  end

  test 'show GDPR dialog if in GDPR country' do
    eu_request = ActionDispatch::Request.new({})
    eu_request.stubs(:params).returns({})
    eu_request.stubs(:gdpr?).returns(true)

    assert GdprDialogHelper.show?(@user, eu_request)
  end
end
