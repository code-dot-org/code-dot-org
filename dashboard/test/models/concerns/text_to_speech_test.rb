require 'test_helper'

class TextToSpeechTest < ActiveSupport::TestCase
  setup do
    @level_without_instructions = Level.create
    @level_with_instructions = Level.create({
      instructions: 'regular instructions'
    })
    @level_with_instructions_override = Level.create({
      instructions: 'regular instructions',
      tts_instructions_override: 'override'
    })
    @level_with_markdown_instructions = Level.create({
      markdown_instructions: '*regular* `markdown_instructions` with _some_ [extra](formatting)'
    })
    @level_with_markdown_instructions_override = Level.create({
      markdown_instructions: 'regular markdown_instructions',
      tts_markdown_instructions_override: 'markdown override'
    })
  end

  test 'tts_instructions_text' do
    assert_equal @level_without_instructions.tts_instructions_text, ''
    assert_equal @level_with_instructions.tts_instructions_text, 'regular instructions'
    assert_equal @level_with_instructions_override.tts_instructions_text, 'override'
  end

  test 'tts_markdown_instructions_text' do
    assert_equal @level_without_instructions.tts_markdown_instructions_text, ''
    assert_equal @level_with_markdown_instructions.tts_markdown_instructions_text, "regular markdown_instructions with some extra (formatting)\n"
    assert_equal @level_with_markdown_instructions_override.tts_markdown_instructions_text, 'markdown override'
  end

  test 'tts_instructions_audio_file' do
    assert_equal @level_without_instructions.tts_instructions_audio_file, 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/.mp3'
    assert_equal @level_with_instructions.tts_instructions_audio_file, 'sharon22k/180/100/256f8062d43018950cc245de47edf8b8/.mp3'
    assert_equal @level_with_instructions_override.tts_instructions_audio_file, 'sharon22k/180/100/e3b3f56615d1e5f2608d2f1130a7ef54/.mp3'
  end

  test 'tts_markdown_instructions_audio_file' do
    assert_equal @level_without_instructions.tts_markdown_instructions_audio_file, 'sharon22k/180/100/d41d8cd98f00b204e9800998ecf8427e/.mp3'
    assert_equal @level_with_markdown_instructions.tts_markdown_instructions_audio_file, 'sharon22k/180/100/0b71e6d353f37836e056407e42042c45/.mp3'
    assert_equal @level_with_markdown_instructions_override.tts_markdown_instructions_audio_file, 'sharon22k/180/100/25352162fcc2d1e5c4ea3f91b9b39c3f/.mp3'
    #"sharon22k/180/100/#{content_hash}/#{self.name}.mp3"
  end
end
