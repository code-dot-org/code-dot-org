require 'test_helper'

class TextToSpeechTest < ActiveSupport::TestCase
  setup do
    @level_without_instructions = Level.create(name: 'level-without-instructions')
    @level_with_instructions = Level.create(
      {
        short_instructions: 'regular instructions that *can* also contain **formatting**',
        name: 'level-with-instructions',
      }
    )
    @level_with_instructions_override = Level.create(
      {
        short_instructions: 'regular instructions that *can* also contain **formatting**',
        name: 'level-with-instructions-override',
        tts_short_instructions_override: 'override',
      }
    )
    @level_with_long_instructions = Level.create(
      {
        long_instructions: '*regular* `markdown_instructions` with _some_ [extra](formatting)',
        name: 'level-with-long-instructions',
      }
    )
    @level_with_long_instructions_override = Level.create(
      {
        long_instructions: 'regular markdown_instructions',
        name: 'level-with-long-instructions-override',
        tts_long_instructions_override: 'markdown override'
      }
    )
    @level_with_raw_html = Level.create(
      {
        long_instructions: 'This should have <br/> no <strong>excess</strong> formatting',
        name: 'level-with-raw-html',
      }
    )
    @level_with_block_html = Level.create(
      {
        long_instructions: "This block should get stripped:\n\n<div><p>Test</p></div>",
        name: 'level-with-block-html',
      }
    )
    @level_with_xml = Level.create(
      {
        long_instructions: "This block should get stripped:\n\n<xml><block type='maze_turn'><title name='DIR'>turnLeft</title></block></xml>",
        name: 'level-with-xml',
      }
    )
  end

  test 'tts_short_instructions_text' do
    assert_equal '', @level_without_instructions.tts_short_instructions_text
    assert_equal "regular instructions that can also contain formatting\n", @level_with_instructions.tts_short_instructions_text
    assert_equal 'override', @level_with_instructions_override.tts_short_instructions_text
  end

  test 'tts_long_instructions_text' do
    assert_equal '', @level_without_instructions.tts_long_instructions_text
    assert_equal "regular markdown_instructions with some \n", @level_with_long_instructions.tts_long_instructions_text
    assert_equal 'markdown override', @level_with_long_instructions_override.tts_long_instructions_text
  end

  test 'tts_short_instructions_audio_file' do
    assert_equal 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/level-without-instructions.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_short_instructions_text)
    assert_equal 'sharon22k/180/100/71c7e35e3633b5dfce472bcbed146e9f/level-with-instructions.mp3', @level_with_instructions.tts_path(@level_with_instructions.tts_short_instructions_text)
    assert_equal 'sharon22k/180/100/e3b3f56615d1e5f2608d2f1130a7ef54/level-with-instructions-override.mp3', @level_with_instructions_override.tts_path(@level_with_instructions_override.tts_short_instructions_text)

    DCDO.stubs(:get).with(TextToSpeech::UPDATED_TTS_PATH_DCDO_KEY, false).returns(true)
    assert_equal 'en-US/d41d8cd98f00b204e9800998ecf8427e/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/sharon22k-180-100.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_short_instructions_text)
    assert_equal 'en-US/71c7e35e3633b5dfce472bcbed146e9f/f79d6e6828e6718bed14558024294018fc4411cd41cee4bac066656f70d8f718/sharon22k-180-100.mp3', @level_with_instructions.tts_path(@level_with_instructions.tts_short_instructions_text)
    assert_equal 'en-US/e3b3f56615d1e5f2608d2f1130a7ef54/ce603774135699e9abdfd65eb1f2733774da58af91782528e82ef5f9efdb8fba/sharon22k-180-100.mp3', @level_with_instructions_override.tts_path(@level_with_instructions_override.tts_short_instructions_text)
    DCDO.unstub(:get)
  end

  test 'tts_long_instructions_audio_file' do
    assert_equal 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/level-without-instructions.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_long_instructions_text)
    assert_equal 'sharon22k/180/100/30a2253e7b14efb1e925743d4afcf405/level-with-long-instructions.mp3', @level_with_long_instructions.tts_path(@level_with_long_instructions.tts_long_instructions_text)
    assert_equal 'sharon22k/180/100/25352162fcc2d1e5c4ea3f91b9b39c3f/level-with-long-instructions-override.mp3', @level_with_long_instructions_override.tts_path(@level_with_long_instructions_override.tts_long_instructions_text)

    DCDO.stubs(:get).with('updated_tts_path', false).returns(true)
    assert_equal 'en-US/d41d8cd98f00b204e9800998ecf8427e/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/sharon22k-180-100.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_long_instructions_text)
    assert_equal 'en-US/30a2253e7b14efb1e925743d4afcf405/80210df1ddaa6daaf02b4f65cf48af881a15ce4e39eb2e42ad32c160111694ff/sharon22k-180-100.mp3', @level_with_long_instructions.tts_path(@level_with_long_instructions.tts_long_instructions_text)
    assert_equal 'en-US/25352162fcc2d1e5c4ea3f91b9b39c3f/961af80b7a080677af7a38483c3d39b432f60493ec527bc4e45e495223c4f3b9/sharon22k-180-100.mp3', @level_with_long_instructions_override.tts_path(@level_with_long_instructions_override.tts_long_instructions_text)
    DCDO.unstub(:get)
  end

  test 'sanitize html and xml' do
    assert_equal "This should have  no excess formatting\n", @level_with_raw_html.tts_long_instructions_text
    assert_equal "This block should get stripped:\n", @level_with_block_html.tts_long_instructions_text
    assert_equal "This block should get stripped:\n", @level_with_xml.tts_long_instructions_text
  end

  test 'tts_long_instructions_text for contained levels' do
    contained_level_freeresponse = create :level, name: 'contained level 1', type: 'FreeResponse', properties: {
      long_instructions: "This is contained"
    }
    outer_level = create :level, name: 'level 1', type: 'Blockly'
    outer_level.update(contained_level_names: [contained_level_freeresponse.name])

    outer_level_with_instructions = create :level, name: 'level 2', type: 'Blockly', long_instructions: "These aren't displayed"
    outer_level_with_instructions.update(contained_level_names: [contained_level_freeresponse.name])

    contained_level_freeresponse_2 = create :level, name: 'contained level 2', type: 'FreeResponse', properties: {
      long_instructions: "This is also contained"
    }
    outer_level_with_multiple_contained_levels = create :level, name: 'level 3', type: 'Blockly'
    outer_level_with_multiple_contained_levels.update(contained_level_names: [contained_level_freeresponse.name, contained_level_freeresponse_2.name])

    contained_level_multi = create :level, name: 'contained level multi', type: 'Multi', properties: {
      markdown: 'Contained',
      questions: [{text: 'Question text'}],
      answers: [
        {"text" => "answer 1", "correct" => false},
        {"text" => "answer 2", "correct" => true},
        {"text" => "answer 3", "correct" => true},
      ]
    }
    outer_level_with_contained_multi_level = create :level, name: 'level 4', type: 'Blockly'
    outer_level_with_contained_multi_level.update(contained_level_names: [contained_level_multi.name])
    assert_equal "This is contained\n", outer_level.tts_long_instructions_text
    assert_equal "This is contained\n", outer_level_with_instructions.tts_long_instructions_text
    assert_equal "This is contained\nThis is also contained\n", outer_level_with_multiple_contained_levels.tts_long_instructions_text
    assert_equal "Contained\nQuestion text\nanswer 1\nanswer 2\nanswer 3\n", outer_level_with_contained_multi_level.tts_long_instructions_text
  end

  test 'tts works for non-english short instructions' do
    translatable_level = create :level, name: 'TTS test Short Instructions',
      type: 'Blockly', short_instructions: "regular instructions in English"

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "short_instructions" => {
          translatable_level.name => "regular instructions in another language"
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n
    assert_equal "regular instructions in another language\n", translatable_level.tts_short_instructions_text
  end

  test 'tts works for non-english long instructions' do
    translatable_level = create :level, name: 'TTS test Long Instructions',
      type: 'Blockly', long_instructions: "long instructions in English"

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "long_instructions" => {
          translatable_level.name => "long instructions in another language"
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n
    assert_equal "long instructions in another language\n", translatable_level.tts_long_instructions_text
  end

  test 'tts works for non-english contained levels' do
    contained_level = create :level, name: 'contained level multi', type: 'Multi', properties: {
      markdown: 'Contained',
      questions: [{text: 'Question text'}],
      answers: [
        {"text" => "answer 1", "correct" => false},
        {"text" => "answer 2", "correct" => true},
        {"text" => "answer 3", "correct" => true},
      ]
    }
    outer_level = create :level, name: 'level 4', type: 'Blockly'
    outer_level.update(contained_level_names: [contained_level.name])

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "dsls" => {
          contained_level.name => {
            questions: [{text: 'texte de la question'}],
            answers: [
              {"text" => "réponse un"},
              {"text" => "réponse deux"},
              {"text" => "réponse troi"},
            ]
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n
    assert_equal "Contained\ntexte de la question\nréponse un\nréponse deux\nréponse troi\n", outer_level.tts_long_instructions_text
  end

  test 'tts ignores overrides for non-english' do
    translatable_level = create :level, name: 'TTS test Short Instructions',
      type: 'Blockly', short_instructions: "regular instructions in English",
      tts_short_instructions_override: "instructions override"

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "short_instructions" => {
          translatable_level.name => "regular instructions in another language"
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n
    assert_equal "regular instructions in another language\n", translatable_level.tts_short_instructions_text
  end

  test 'updating the long instructions for a level should cause it to create new long instructions audio' do
    level = create :level,
      name: 'level 1',
      type: 'Blockly',
      long_instructions: "test long instructions",
      published: true
    level.save

    Policies::LevelFiles.stubs(:write_to_file?).returns(true)

    refute level.tts_should_update_long_instructions?
    level.long_instructions = "test long instructions updated"
    assert level.tts_should_update_long_instructions?
  end

  test 'updating the contained level for a level should cause it to create new long instructions audio' do
    contained_level_one = create :level, name: 'contained level 1', type: 'FreeResponse', properties: {
      long_instructions: "This is the first contained"
    }
    contained_level_two = create :level, name: 'contained level 2', type: 'FreeResponse', properties: {
      long_instructions: "This is the second contained"
    }
    outer_level = create :level, name: 'level 1', type: 'Blockly', published: true
    outer_level.update(contained_level_names: [contained_level_one.name])

    Policies::LevelFiles.stubs(:write_to_file?).returns(true)

    refute outer_level.tts_should_update_long_instructions?
    outer_level.contained_level_names = [contained_level_two.name]
    assert outer_level.tts_should_update_long_instructions?
  end

  test 'tts_url should return nil given locale not supported for TTS' do
    assert_nil(@level_without_instructions.tts_url(@level_without_instructions.tts_short_instructions_text, :'te-ST'))

    DCDO.stubs(:get).with('updated_tts_path', false).returns(true)
    assert_nil(@level_without_instructions.tts_url(@level_without_instructions.tts_short_instructions_text, :'te-ST'))
    DCDO.unstub(:get)
  end

  test 'tts_url should return a url to a tts file' do
    expected_tts_url = 'https://tts.code.org/sharon22k/180/100/71c7e35e3633b5dfce472bcbed146e9f/level-with-instructions.mp3'
    assert_equal(expected_tts_url, @level_with_instructions.tts_url(@level_with_instructions.tts_short_instructions_text, :'en-US'))

    DCDO.stubs(:get).with('updated_tts_path', false).returns(true)
    expected_tts_url = 'https://tts.code.org/en-US/71c7e35e3633b5dfce472bcbed146e9f/f79d6e6828e6718bed14558024294018fc4411cd41cee4bac066656f70d8f718/sharon22k-180-100.mp3'
    assert_equal(expected_tts_url, @level_with_instructions.tts_url(@level_with_instructions.tts_short_instructions_text, :'en-US'))
    DCDO.unstub(:get)
  end
end
