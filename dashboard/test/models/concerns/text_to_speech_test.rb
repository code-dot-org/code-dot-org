require 'test_helper'

class TextToSpeechTest < ActiveSupport::TestCase
  setup do
    @level_without_instructions = Level.create
    @level_with_instructions = Level.create(
      {instructions: 'regular instructions'}
    )
    @level_with_instructions_override = Level.create(
      {
        instructions: 'regular instructions',
        tts_short_instructions_override: 'override'
      }
    )
    @level_with_markdown_instructions = Level.create(
      {
        markdown_instructions: '*regular* `markdown_instructions` with _some_ [extra](formatting)'
      }
    )
    @level_with_markdown_instructions_override = Level.create(
      {
        markdown_instructions: 'regular markdown_instructions',
        tts_long_instructions_override: 'markdown override'
      }
    )
    @level_with_raw_html = Level.create(
      {
        markdown_instructions: 'This should have <br/> no <strong>excess</strong> formatting'
      }
    )
    @level_with_block_html = Level.create(
      {
        markdown_instructions: "This block should get stripped:\n\n<div><p>Test</p></div>"
      }
    )
    @level_with_xml = Level.create(
      {
        markdown_instructions: "This block should get stripped:\n\n<xml><block type='maze_turn'><title name='DIR'>turnLeft</title></block></xml>"
      }
    )
  end

  test 'tts_short_instructions_text' do
    assert_equal '', @level_without_instructions.tts_short_instructions_text
    assert_equal 'regular instructions', @level_with_instructions.tts_short_instructions_text
    assert_equal 'override', @level_with_instructions_override.tts_short_instructions_text
  end

  test 'tts_long_instructions_text' do
    assert_equal '', @level_without_instructions.tts_long_instructions_text
    assert_equal "regular markdown_instructions with some \n", @level_with_markdown_instructions.tts_long_instructions_text
    assert_equal 'markdown override', @level_with_markdown_instructions_override.tts_long_instructions_text
  end

  test 'tts_short_instructions_audio_file' do
    assert_equal 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_short_instructions_text)
    assert_equal 'sharon22k/180/100/256f8062d43018950cc245de47edf8b8/.mp3', @level_with_instructions.tts_path(@level_with_instructions.tts_short_instructions_text)
    assert_equal 'sharon22k/180/100/e3b3f56615d1e5f2608d2f1130a7ef54/.mp3', @level_with_instructions_override.tts_path(@level_with_instructions_override.tts_short_instructions_text)
  end

  test 'tts_long_instructions_audio_file' do
    assert_equal 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/.mp3', @level_without_instructions.tts_path(@level_without_instructions.tts_long_instructions_text)
    assert_equal 'sharon22k/180/100/30a2253e7b14efb1e925743d4afcf405/.mp3', @level_with_markdown_instructions.tts_path(@level_with_markdown_instructions.tts_long_instructions_text)
    assert_equal 'sharon22k/180/100/25352162fcc2d1e5c4ea3f91b9b39c3f/.mp3', @level_with_markdown_instructions_override.tts_path(@level_with_markdown_instructions_override.tts_long_instructions_text)
  end

  test 'sanitize html and xml' do
    assert_equal "This should have  no excess formatting\n", @level_with_raw_html.tts_long_instructions_text
    assert_equal "This block should get stripped:\n", @level_with_block_html.tts_long_instructions_text
    assert_equal "This block should get stripped:\n", @level_with_xml.tts_long_instructions_text
  end
end
