require 'test_helper'

class ThankDonorsInterstitialHelperTest < ActionView::TestCase
  setup do
    @request = ActionDispatch::Request.new({})
    @request.stubs(:gdpr?).returns(false)
    @request.stubs(:params).returns({})

    SchoolInfoInterstitialHelper.stubs(:show?).returns(false)
    SchoolInfoInterstitialHelper.stubs(:show_confirmation_dialog?).returns(false)
  end

  test 'do not show thank donors interstitial if user is not signed in' do
    refute ThankDonorsInterstitialHelper.show?(nil, @request)
  end

  test 'do not show thank donors interstitial to student who has signed in multiple times' do
    student = build :user, sign_in_count: 2

    refute ThankDonorsInterstitialHelper.show?(student, @request)
  end

  test 'do not show thank donors interstitial to student with no age information' do
    student = build :user, birthday: nil

    refute ThankDonorsInterstitialHelper.show?(student, @request)
  end

  test 'do not show thank donors interstitial to teacher who will see school info interstitial' do
    teacher = build :teacher, sign_in_count: 1, terms_of_service_version: 1

    SchoolInfoInterstitialHelper.stubs(:show?).returns(true)
    refute ThankDonorsInterstitialHelper.show?(teacher, @request)
  end

  test 'do not show thank donors interstitial to teacher who will see school info confirmation dialog' do
    teacher = build :teacher, sign_in_count: 1, terms_of_service_version: 1

    SchoolInfoInterstitialHelper.stubs(:show_confirmation_dialog?).returns(true)
    refute ThankDonorsInterstitialHelper.show?(teacher, @request)
  end

  test 'do not show thank donors interstitial to teacher who has not accepted terms of service' do
    teacher = build :teacher, terms_of_service_version: nil

    refute ThankDonorsInterstitialHelper.show?(teacher, @request)
  end

  test 'do not show thank donors interstitial to a student who has not accepted GDPR terms' do
    @request.stubs(:gdpr?).returns(true)

    student = build :user, sign_in_count: 1
    refute ThankDonorsInterstitialHelper.show?(student, @request)
  end

  test 'show thank donors interstitial to users on first login' do
    student = build :user, sign_in_count: 1

    assert ThankDonorsInterstitialHelper.show?(student, @request)
  end

  test 'show thank donors interstitial to teacher on first login' do
    teacher = build :teacher, sign_in_count: 1, terms_of_service_version: 1

    assert ThankDonorsInterstitialHelper.show?(teacher, @request)
  end
end
