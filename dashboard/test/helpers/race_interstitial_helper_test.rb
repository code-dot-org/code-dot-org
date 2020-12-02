require 'test_helper'

class RaceInterstitialHelperTest < ActionView::TestCase
  def mock_geocoder_result(result)
    mock_us_object = OpenStruct.new(country_code: result)
    Geocoder.stubs(:search).returns([mock_us_object])
  end

  def setup
    mock_geocoder_result('US')

    # Create a student over 13 with an account that was first
    # signed into more than a week ago and an associated IP address.
    # We expect that such a user would see the race interstitial helper.
    @user = create :student
    @user.current_sign_in_ip = "127.0.0.1"

    SignIn.create(
      user_id: @user.id,
      sign_in_count: 1,
      sign_in_at: DateTime.now - 8.days
    )
  end

  test 'do not show race interstitial to teacher' do
    @user.user_type = User::TYPE_TEACHER
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to user accounts under 13' do
    @user.age = 8
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to user if we do not have sign in information' do
    SignIn.find_by(
      user_id: @user.id,
      sign_in_count: 1
    ).delete

    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to user accounts who signed in for the first time less than a week ago' do
    sign_in = SignIn.find_by(
      user_id: @user.id,
      sign_in_count: 1
    )
    sign_in.update(sign_in_at: DateTime.now - 3.days)

    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to user accounts that have already entered race information' do
    @user.update_columns(races: 'white,black')
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to user accounts that have closed the dialog already' do
    @user.update_columns(races: 'closed_dialog')
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial if IP address is nil' do
    @user.current_sign_in_ip = nil
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'do not show race interstitial to non-US users' do
    mock_geocoder_result('CA')
    refute RaceInterstitialHelper.show?(@user)
  end

  test 'show race interstitial to US users' do
    assert RaceInterstitialHelper.show?(@user)
  end
end
