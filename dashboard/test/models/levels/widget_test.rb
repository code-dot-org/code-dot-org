require 'test_helper'

class WidgetTest < ActiveSupport::TestCase
  setup_all do
    @level = Widget.create!(
      name: 'Test Widget',
      long_instructions: 'These are the **markdown** instructions for the test widget.',
      level_num: 'custom'
    )
  end

  test 'widget_app_options are camelized' do
    refute_includes @level.widget_app_options.keys, 'long_instructions'
    assert_includes @level.widget_app_options.keys, 'longInstructions'
  end

  test 'widget_app_options are localized' do
    test_locale = :'te-ST'
    I18n.locale = test_locale
    translated_instruction = 'These are the **translated** long instructions'
    translated_short_instruction = 'These are **translated** short instructions'
    translation_data = {
      data: {
        long_instructions: {
          @level.name => translated_instruction
        },
        short_instructions: {
          @level.name => translated_short_instruction
        }
      }
    }
    I18n.backend.store_translations(test_locale, translation_data)

    assert @level.should_localize?
    assert_equal translated_instruction, @level.widget_app_options['longInstructions']
    assert_equal translated_short_instruction, @level.widget_app_options['shortInstructions']

    I18n.locale = I18n.default_locale
  end
end
