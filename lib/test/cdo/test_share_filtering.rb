require_relative '../test_helper'
require 'cdo/share_filtering'

class ShareFilteringTest < Minitest::Test
  # @param title_name [String] The name of the title of the program.
  # @param title_text [String] The text of the title of the program.
  # @return [String] A sample program.
  def generate_program(title_name, title_text)
    '<xml><block type="when_run" deletable="false">'\
      '<next><block type="studio_showTitleScreen">'\
      "<title name=\"TITLE\">#{title_name}</title>"\
      "<title name=\"TEXT\">#{title_text}</title>"\
      '</block></next></block></xml>'
  end

  def test_find_share_failure_with_email_address
    program = generate_program('My Email', 'test@example.com')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'test@example.com'),
      ShareFiltering.find_share_failure(program, 'en')
    )
  end

  def test_find_share_failure_with_street_address
    Geocoder.
      stubs(:find_potential_street_address).
      returns('1600 Pennsylvania Ave NW, Washington, DC 20500')

    program = generate_program(
      'My Street Address',
      '1600 Pennsylvania Ave NW, Washington, DC 20500'
    )
    assert_equal(
      ShareFailure.new(
        ShareFiltering::FailureType::ADDRESS,
        '1600 Pennsylvania Ave NW, Washington, DC 20500'
      ),
      ShareFiltering.find_share_failure(program, 'en')
    )
  end

  def test_find_share_failure_with_phone_number
    Geocoder.
      stubs(:find_potential_street_address).
      returns(nil)

    program = generate_program('My Phone Number', '123-456-7890')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PHONE, '123-456-7890'),
      ShareFiltering.find_share_failure(program, 'en')
    )
  end

  def test_find_share_failure_with_profanity
    WebPurify.stubs(:find_potential_profanities).returns(['damn'])

    program = generate_program('My Profanity', 'damn')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'),
      ShareFiltering.find_share_failure(program, 'en')
    )
  end

  def test_profanity_with_italian_edge_case
    # "fu" is a past-tense "to be" in Italian, but should be blocked
    # as profanity in English.  WebPurify doesn't support this, so we
    # have custom filtering that takes locale into account for this word.
    program = generate_program('My Custom Profanity', 'fu')
    innocent_program = generate_program('My Innocent Program', 'funny tofu')

    # Stub WebPurify because we expect our custom blocking to handle this case.
    WebPurify.stubs(:find_potential_profanities).returns(nil)

    # Blocked in English
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      ShareFiltering.find_share_failure(program, 'en')
    )

    # But the innocent program is fine
    assert_nil(
      ShareFiltering.find_share_failure(innocent_program, 'en')
    )

    # Blocked in Spanish
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      ShareFiltering.find_share_failure(program, 'es')
    )

    # Allowed in Italian
    assert_nil(
      ShareFiltering.find_share_failure(program, 'it')
    )
  end

  def test_profanity_with_swedish_edge_case
    # "fick" means "got" in Swedish, but should be blocked
    # as profanity in English.  WebPurify doesn't support this, so we
    # have custom filtering that takes locale into account for this word.
    questionable_program = generate_program('My Custom Profanity', 'fick')
    innocent_program = generate_program('My Innocent Program', 'fickle')

    # Stub WebPurify because we expect our custom blocking to handle this case.
    WebPurify.stubs(:find_potential_profanities).returns(nil)

    # Blocked in English
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fick'),
      ShareFiltering.find_share_failure(questionable_program, 'en')
    )

    # But the innocent program is fine
    assert_nil(
      ShareFiltering.find_share_failure(innocent_program, 'en')
    )

    # Blocked in Italian
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fick'),
      ShareFiltering.find_share_failure(questionable_program, 'it')
    )

    # Allowed in Swedish
    assert_nil(
      ShareFiltering.find_share_failure(questionable_program, 'sv')
    )
  end

  def test_find_share_failure_for_non_playlab
    program = '<xml><block type=\"controls_repeat\">'\
      '<title name=\"TIMES\">4</title><statement name=\"DO\">'\
      '<block type=\"draw_move_by_constant\">'\
      '<title name=\"DIR\">moveForward</title>'\
      '<title name=\"VALUE\">100</title><next>'\
      '<block type=\"draw_turn_by_constant_restricted\">'\
      '<title name=\"DIR\">turnRight</title>'\
      '<title name=\"VALUE\">90</title></block></next></block></statement>'\
      '</block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en')
  end

  def test_find_share_failure_for_playlab_without_user_text_indicators
    program = '<xml><block type="when_run" deletable="false"><next>'\
      '<block type="studio_showTitleScreen"></block></next></block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en')
  end

  def test_find_name_failure_calls_find_failure
    text = 'project title'
    locale = 'en'
    ShareFiltering.expects(:find_failure).with(text, locale).returns nil
    assert_nil ShareFiltering.find_name_failure(text, locale)
  end
end
