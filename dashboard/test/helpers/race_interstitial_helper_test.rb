require 'test_helper'

class RaceInterstitialHelperTest < ActionView::TestCase
  def mock_geocoder_result(result)
    mock_us_object = OpenStruct.new(country_code: result)
    Geocoder.stubs(:search).returns([mock_us_object])
  end

  test 'do not show race interstitial to teacher' do
    mock_geocoder_result('US')
    teacher = create :teacher, created_at: DateTime.now - 8
    refute RaceInterstitialHelper.show?(teacher)
  end

  test 'do not show race interstitial to user accounts under 13' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8, age: 8
    student.created_at = DateTime.now - 8
    refute RaceInterstitialHelper.show?(student)
  end

  test 'do not show race interstitial to user accounts less than one week old' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 3
    refute RaceInterstitialHelper.show?(student)
  end

  test 'do not show race interstitial to user accounts that have already entered race information' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    student.update_columns(races: 'white,black')
    refute RaceInterstitialHelper.show?(student)
  end

  test 'do not show race interstitial to user accounts that have closed the dialog already' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    student.update_columns(races: 'closed_dialog')
    refute RaceInterstitialHelper.show?(student)
  end

  test 'do not show race interstitial if IP address is nil' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8, current_sign_in_ip: nil
    refute RaceInterstitialHelper.show_race_interstitial?(student, mock_ip)
  end

  test 'do not show race interstitial to non-US users' do
    mock_geocoder_result('CA')
    student = create :student, created_at: DateTime.now - 8
    refute RaceInterstitialHelper.show?(student)
  end

  test 'show race interstitial to US users' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    assert RaceInterstitialHelper.show?(student)
  end

  test 'show race interstitial for student over 13 with account more than 1 week old' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    assert RaceInterstitialHelper.show?(student)
  end
end
