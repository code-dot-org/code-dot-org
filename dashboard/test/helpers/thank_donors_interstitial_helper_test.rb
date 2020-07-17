require 'test_helper'

class ThankDonorsInterstitialHelperTest < ActionView::TestCase
  test 'do not show thank donors interstitial if user is not signed in' do
    refute ThankDonorsInterstitialHelper.show?(nil)
  end

  test 'do not show thank donors interstitial to student who has signed in multiple times' do
    student = build :user, sign_in_count: 2

    refute ThankDonorsInterstitialHelper.show? student
  end

  test 'do not show thank donors interstitial to student with no age information' do
    student = build :user, birthday: nil

    refute ThankDonorsInterstitialHelper.show? student
  end

  test 'do not show thank donors interstitial to teacher who has not accepted terms of service' do
    teacher = build :teacher, terms_of_service_version: nil

    refute ThankDonorsInterstitialHelper.show? teacher
  end

  test 'show thank donors interstitial to users on first login' do
    student = build :user, sign_in_count: 1

    assert ThankDonorsInterstitialHelper.show? student
  end

  test 'show thank donors interstitial to teacher on first login' do
    teacher = build :teacher, sign_in_count: 1, terms_of_service_version: 1

    assert ThankDonorsInterstitialHelper.show? teacher
  end
end
