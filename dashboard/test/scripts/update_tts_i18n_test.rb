require 'test_helper'

require_relative File.join(Rails.root, 'scripts/update_tts_i18n')

class UpdateTtsI18nTest < ActiveSupport::TestCase
  test_locale = :'te-ST'

  test 'levels with translations will generate audio for those translations' do
    level = create(:level, :blockly, name: "translated level", short_instructions: "test short instructions")
    custom_i18n = {
      "data" => {
        "short_instructions" => {
          level.name => "translated short instructions"
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    level.expects(:tts_upload_to_s3).with("translated short instructions\n")
    I18n.locale = test_locale
    update_level_tts_i18n(level)
  end

  test 'untranslated levels do not generate new audio' do
    level = create(:level, :blockly, name: "untranslated level", short_instructions: "test short instructions")
    level.expects(:tts_upload_to_s3).never
    I18n.locale = test_locale
    update_level_tts_i18n(level)
  end

  test 'contained levels are supported' do
    create :multi, name: 'contained level', long_instructions: "contained level long instructions"
    level = create :maze, name: 'containing level', contained_level_names: ['contained level']

    level.expects(:tts_upload_to_s3).with("contained level long instructions\n")
    I18n.locale = test_locale
    update_level_tts_i18n(level)
  end
end
