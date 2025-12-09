require_relative '../test_helper'
require 'cdo/share_filtering'

class ShareFilteringTest < Minitest::Test
  # @param title_name [String] The name of the title of the program.
  # @param title_text [String] The text of the title of the program.
  # @return [String] A sample XML program.
  def generate_xml_program(title_name, title_text)
    '<xml><block type="when_run" deletable="false" id="whenRun">' \
      '<next><block type="studio_showTitleScreen">' \
      "<title name=\"TITLE\">#{title_name}</title>" \
      "<title name=\"TEXT\">#{title_text}</title>" \
      '</block></next></block></xml>'
  end

  # @return [String] A sample JSON program.
  def generate_json_program
    {
      "variables" => [
        {"name" => "myVar"},
        {"name" => ""},
      ],
      "blocks" => {
        "languageVersion" => 0,
        "blocks" => [
          {
            "type" => "when_run",
            "id"   => "abc123",
            "fields" => {
              "TEXT" => '"some text"'
            },
            "inputs" => {},
            "next" => {
              "block" => {
                "type" => "gamelab_comment",
                "id"   => "cmt001",
                "fields" => {
                  "COMMENT" => '<field name="C">nice comment</field>'
                },
                "inputs" => {
                  "INPUT1" => {
                    "block" => {
                      "type" => "some_block",
                      "id"   => "blk002",
                      "fields" => {
                        "TEXT" => '"inner text"'
                      },
                    },
                  }
                },
              }
            }
          }
        ]
      }
    }.to_json
  end

  def test_find_share_failure_with_email_address
    program = generate_xml_program('My Email', 'test@example.com')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'test@example.com'),
      ShareFiltering.find_share_failure(program, 'en', 'playlab')
    )

    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'test@example.com'),
      assert_raises(PIIFilterException) do
        ShareFiltering.find_share_failure(program, 'en', 'playlab', exceptions: true)
      end.share_failure
    )
  end

  def test_find_share_failure_with_street_address
    Geocoder.
      stubs(:find_potential_street_address).
      returns('1600 Pennsylvania Ave NW, Washington, DC 20500')

    program = generate_xml_program(
      'My Street Address',
      '1600 Pennsylvania Ave NW, Washington, DC 20500'
    )
    assert_equal(
      ShareFailure.new(
        ShareFiltering::FailureType::ADDRESS,
        '1600 Pennsylvania Ave NW, Washington, DC 20500'
      ),
      ShareFiltering.find_share_failure(program, 'en', 'playlab')
    )

    assert_equal(
      ShareFailure.new(
        ShareFiltering::FailureType::ADDRESS,
        '1600 Pennsylvania Ave NW, Washington, DC 20500'
      ),
      assert_raises(PIIFilterException) do
        ShareFiltering.find_share_failure(program, 'en', 'playlab', exceptions: true)
      end.share_failure
    )
  end

  def test_find_share_failure_with_phone_number
    Geocoder.
      stubs(:find_potential_street_address).
      returns(nil)

    program = generate_xml_program('My Phone Number', '123-456-7890')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PHONE, '123-456-7890'),
      ShareFiltering.find_share_failure(program, 'en', 'playlab')
    )

    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PHONE, '123-456-7890'),
      assert_raises(PIIFilterException) do
        ShareFiltering.find_share_failure(program, 'en', 'playlab', exceptions: true)
      end.share_failure
    )
  end

  def test_find_share_failure_with_profanity
    WebPurify.stubs(:find_potential_profanities).returns(['damn'])

    program = generate_xml_program('My Profanity', 'damn')
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'),
      ShareFiltering.find_share_failure(program, 'en', 'playlab')
    )

    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'),
      assert_raises(ProfanityFilterException) do
        ShareFiltering.find_share_failure(program, 'en', 'playlab', exceptions: true)
      end.share_failure
    )
  end

  def test_profanity_with_italian_edge_case
    # "fu" is a past-tense "to be" in Italian, but should be blocked
    # as profanity in English.  WebPurify doesn't support this, so we
    # have custom filtering that takes locale into account for this word.
    program = generate_xml_program('My Custom Profanity', 'fu')
    innocent_program = generate_xml_program('My Innocent Program', 'funny tofu')

    # Stub WebPurify because we expect our custom blocking to handle this case.
    WebPurify.stubs(:find_potential_profanities).returns(nil)

    # Blocked in English
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      ShareFiltering.find_share_failure(program, 'en', 'playlab')
    )

    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      assert_raises(ProfanityFilterException) do
        ShareFiltering.find_share_failure(program, 'en', 'playlab', exceptions: true)
      end.share_failure
    )

    # But the innocent program is fine
    assert_nil(
      ShareFiltering.find_share_failure(innocent_program, 'en', 'playlab')
    )

    # Should not raise an exception
    ShareFiltering.find_share_failure(innocent_program, 'en', 'playlab', exceptions: true)

    # Blocked in Spanish
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      ShareFiltering.find_share_failure(program, 'es', 'playlab')
    )

    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fu'),
      assert_raises(ProfanityFilterException) do
        ShareFiltering.find_share_failure(program, 'es', 'playlab', exceptions: true)
      end.share_failure
    )

    # Allowed in Italian
    assert_nil(
      ShareFiltering.find_share_failure(program, 'it', 'playlab')
    )

    # Should not raise an exception
    ShareFiltering.find_share_failure(program, 'it', 'playlab', exceptions: true)
  end

  def test_profanity_with_swedish_edge_case
    # "fick" means "got" in Swedish, but should be blocked
    # as profanity in English.  WebPurify doesn't support this, so we
    # have custom filtering that takes locale into account for this word.
    questionable_program = generate_xml_program('My Custom Profanity', 'fick')
    innocent_program = generate_xml_program('My Innocent Program', 'fickle')

    # Stub WebPurify because we expect our custom blocking to handle this case.
    WebPurify.stubs(:find_potential_profanities).returns(nil)

    # Blocked in English
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fick'),
      ShareFiltering.find_share_failure(questionable_program, 'en', 'playlab')
    )

    # But the innocent program is fine
    assert_nil(
      ShareFiltering.find_share_failure(innocent_program, 'en', 'playlab')
    )

    # Blocked in Italian
    assert_equal(
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'fick'),
      ShareFiltering.find_share_failure(questionable_program, 'it', 'playlab')
    )

    # Allowed in Swedish
    assert_nil(
      ShareFiltering.find_share_failure(questionable_program, 'sv', 'playlab')
    )
  end

  def test_find_share_failure_for_non_filtered_project_types
    program = '<xml><block type=\"controls_repeat\">' \
      '<title name=\"TIMES\">4</title><statement name=\"DO\">' \
      '<block type=\"draw_move_by_constant\">' \
      '<title name=\"DIR\">moveForward</title>' \
      '<title name=\"VALUE\">100</title><next>' \
      '<block type=\"draw_turn_by_constant_restricted\">' \
      '<title name=\"DIR\">turnRight</title>' \
      '<title name=\"VALUE\">90</title></block></next></block></statement>' \
      '</block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en', 'gamelab')
  end

  def test_find_share_failure_for_playlab_without_user_text_indicators
    program = '<xml><block type="when_run" deletable="false"><next>' \
      '<block type="studio_showTitleScreen"></block></next></block></xml>'
    assert_nil ShareFiltering.find_share_failure(program, 'en', 'playlab')
  end

  def test_find_name_failure_calls_find_failure
    text = 'project title'
    locale = 'en'
    ShareFiltering.expects(:find_failure).with(text, locale, {}, exceptions: false).returns nil
    assert_nil ShareFiltering.find_name_failure(text, locale)
  end

  def test_clean_text_value_helper_function
    # Field-tagged value
    wrapped = '<field name="TITLE">"hello world"</field>'
    assert_equal 'hello world', ShareFiltering.clean_text_value(wrapped)

    # No field tag, just quotes
    simple_string = '"just some text"'
    assert_equal 'just some text', ShareFiltering.clean_text_value(simple_string)

    # Non-string or nil
    assert_nil ShareFiltering.clean_text_value(nil)
    assert_nil ShareFiltering.clean_text_value(123)
  end

  def test_extract_text_blockly_helper_function
    json = generate_json_program
    texts = ShareFiltering.extract_text_blockly(json)

    # should strip quotes around the TEXT fields
    assert_includes texts, 'some text'
    assert_includes texts, 'inner text'
    # no duplicates
    assert_equal texts.uniq, texts
    # should have exactly two entries
    assert_equal 2, texts.length
  end

  def test_should_filter_program_check_project_type
    Gatekeeper.stubs(:allows).with('webpurify', default: true).returns(true)
    # 'gamelab' is not in FILTERED_PROJECT_TYPES
    json_program_with_indicator = generate_json_program
    assert_equal false, ShareFiltering.should_filter_program(json_program_with_indicator, 'gamelab')
    assert_equal true, ShareFiltering.should_filter_program(json_program_with_indicator, 'poetry')
  end

  def test_should_filter_program_playlab_only_with_indicator
    Gatekeeper.stubs(:allows).with('webpurify', default: true).returns(true)
    indicator = ShareFiltering::USER_ENTERED_TEXT_FIELDS.first

    # no indicator in program
    no_indicator = "<xml><block type=\"studio_showTitleScreen\"/></xml>"
    assert_equal false, ShareFiltering.should_filter_program(no_indicator, 'playlab')

    # has an indicator somewhere
    with_indicator = "<xml><field name=\"FNAME\">#{indicator}</field></xml>"
    assert_equal true,
      ShareFiltering.should_filter_program(with_indicator, 'playlab')
  end
end
