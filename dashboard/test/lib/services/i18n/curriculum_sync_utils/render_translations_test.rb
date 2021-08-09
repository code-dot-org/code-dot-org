require 'test_helper'

class Services::I18n::CurriculumSyncUtils::RenderTranslationsTest < ActiveSupport::TestCase
  setup_all do
    @lesson = create(:lesson, overview: "This is the english overview")
    @activity_section = create(:activity_section, name: "English name", description: "English description")
    @test_locale = :"te-ST"
    custom_i18n = {
      "data" => {
        "lessons" => {
          "#{@lesson.script.name}/#{@lesson.key}" => {
            "overview" => "This is the translated overview"
          }
        },
        "activity_sections" => {
          @activity_section.key => {
            "name" => "Translated name",
            "description" => "Translated description"
          }
        }
      }
    }
    ::I18n.backend.store_translations(@test_locale, custom_i18n)
  end

  setup do
    ::I18n.locale = @test_locale
  end

  teardown do
    ::I18n.locale = ::I18n.default_locale
  end

  test "get_localized_property defaults to English" do
    # when we don't have a value
    activity_section = create(:activity_section, name: "default name")
    assert_equal("default name", Services::I18n::CurriculumSyncUtils.get_localized_property(activity_section, :name))

    # or when the locale is english
    ::I18n.locale = ::I18n.default_locale
    assert_equal("English name", Services::I18n::CurriculumSyncUtils.get_localized_property(@activity_section, :name))
  end

  test "get_localized_property can use either default or custom key" do
    assert_equal("Translated name", Services::I18n::CurriculumSyncUtils.get_localized_property(@activity_section, :name))
    assert_equal("Translated name", Services::I18n::CurriculumSyncUtils.get_localized_property(@activity_section, :name, @activity_section.key))

    assert_equal("This is the english overview", Services::I18n::CurriculumSyncUtils.get_localized_property(@lesson, :overview))
    lesson_key = "#{@lesson.script.name}/#{@lesson.key}"
    assert_equal("This is the translated overview", Services::I18n::CurriculumSyncUtils.get_localized_property(@lesson, :overview, lesson_key))
  end
end
