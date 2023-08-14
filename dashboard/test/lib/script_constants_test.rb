require 'test_helper'

class ScriptConstantsTest < ActiveSupport::TestCase
  def test_csf_next_course_recommendation
    {
      "course1" => "course2",
      "course2" => "course3",
      "course3" => "course4",
      "accelerated" => "course4",
      "course4" => "applab-intro",

      "coursea-2019" => "courseb-2019",
      "courseb-2019" => "coursec-2019",
      "coursec-2019" => "coursed-2019",
      "coursed-2019" => "coursee-2019",
      "coursee-2019" => "coursef-2019",
      "pre-express-2019" => "coursec-2019",
      "coursef-2019" => "applab-intro",
      "express-2019" => "applab-intro",

      "coursea-2020" => "courseb-2020",
      "courseb-2020" => "coursec-2020",
      "coursec-2020" => "coursed-2020",
      "coursed-2020" => "coursee-2020",
      "coursee-2020" => "coursef-2020",
      "pre-express-2020" => "coursec-2020",
      "coursef-2020" => "applab-intro",
      "express-2020" => "applab-intro",
    }.each do |course_name, expected|
      assert_equal expected, ScriptConstants.csf_next_course_recommendation(course_name), "course: #{course_name}"
    end

    assert_nil ScriptConstants.csf_next_course_recommendation("something-unknown")
  end

  [
    *ScriptConstants::CATEGORIES[:csf], *ScriptConstants::CATEGORIES[:csf_2018], *ScriptConstants::CATEGORIES[:csf_2019],
    *ScriptConstants::CATEGORIES[:csf_2020], *ScriptConstants::CATEGORIES[:csf_2021], *ScriptConstants::CATEGORIES[:csf_2022],
    *ScriptConstants::CATEGORIES[:csd], *ScriptConstants::CATEGORIES[:csd_2018], *ScriptConstants::CATEGORIES[:csd_2019],
    *ScriptConstants::CATEGORIES[:csd_2021], *ScriptConstants::CATEGORIES[:csd_2022], *ScriptConstants::CATEGORIES[:twenty_hour],
    *ScriptConstants::CATEGORIES[:hoc], ScriptConstants::JIGSAW_NAME, *ScriptConstants::ADDITIONAL_I18N_UNITS
  ].uniq.each do |script|
    test "ScriptConstants.i18n? returns true when the script is #{script}" do
      assert ScriptConstants.i18n?(script)
    end
  end

  test 'ScriptConstants.i18n? returns false when the script is not translatable' do
    refute ScriptConstants.i18n?('untranslatable')
  end
end
