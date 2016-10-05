require_relative '../../../shared/test/test_helper'
require 'cdo/share_filtering'

class ShareFilteringTest < Minitest::Test
  def setup
    Geocoder.configure(:lookup => :test)
    Geocoder::Lookup::Test.add_stub(
      '1600 Pennsylvania Ave NW, Washington, DC 20500',
      [{types: 'street_address'}]
    )
    Geocoder::Lookup::Test.set_default_stub([{types: []}])
  end

  def test_find_share_failure_with_email_address
    program = '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">My Email</title><title name="TEXT">test@example.com</title></block></next></block></xml>'
    assert_equal ShareFailure.new(ShareFiltering::FailureType::EMAIL, "test@example.com"),
      ShareFiltering.find_share_failure(program, 'en')
  end

  def test_find_share_failure_with_street_address
    program = '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">My Street Address</title><title name="TEXT">1600 Pennsylvania Ave NW, Washington, DC 20500</title></block></next></block></xml>'
    assert_equal ShareFailure.new(ShareFiltering::FailureType::ADDRESS, '1600 Pennsylvania Ave NW, Washington, DC 20500'),
      ShareFiltering.find_share_failure(program, 'en')
  end

  def test_find_share_failure_with_phone_number
    program = '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">My Phone Number</title><title name="TEXT">123-456-7890</title></block></next></block></xml>'
    assert_equal ShareFailure.new(ShareFiltering::FailureType::PHONE, '123-456-7890'),
      ShareFiltering.find_share_failure(program, 'en')
  end

  # TODO(asher): Fix and uncomment this test by appropriately stubbing / mocking
  #   WebPurify.find_potential_profanity).
  # def test_find_share_failure_with_profanity
  #   program = '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">My Profanity</title><title name="TEXT">shit</title></block></next></block></xml>'
  #   assert_equal ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'),
  #     ShareFiltering.find_share_failure(program, 'en')
  # end

  def test_find_share_failure_for_non_playlab
    program = '<xml><block type=\"controls_repeat\"><title name=\"TIMES\">4</title><statement name=\"DO\"><block type=\"draw_move_by_constant\"><title name=\"DIR\">moveForward</title><title name=\"VALUE\">100</title><next><block type=\"draw_turn_by_constant_restricted\"><title name=\"DIR\">turnRight</title><title name=\"VALUE\">90</title></block></next></block></statement></block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en')
  end

  def test_find_share_failure_for_playlab_without_user_text_indicators
    program = '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"></block></next></block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en')
  end
end
