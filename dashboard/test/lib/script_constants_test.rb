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
    *CATEGORIES[:csd],
    *CATEGORIES[:csd_2018],
    *CATEGORIES[:csd_2019],
    *CATEGORIES[:csd_2021],
    *CATEGORIES[:csd_2022],
    *CATEGORIES[:csd_2023],

    *CATEGORIES[:csf],
    *CATEGORIES[:csf_2018],
    *CATEGORIES[:csf_2019],
    *CATEGORIES[:csf_2020],
    *CATEGORIES[:csf_2021],
    *CATEGORIES[:csf_2022],
    *CATEGORIES[:csf_2023],
    *CATEGORIES[:csf_international],

    *CATEGORIES[:twenty_hour],
    *CATEGORIES[:hoc],
    *ADDITIONAL_I18N_UNITS,
    *TRANSLATEABLE_CSC_UNITS,
    JIGSAW_NAME,
  ].uniq.each do |script|
    test "ScriptConstants.i18n? returns true when the script is #{script}" do
      assert ScriptConstants.i18n?(script)
    end
  end

  test 'ScriptConstants.i18n? returns false when the script is not translatable' do
    refute ScriptConstants.i18n?('untranslatable')
  end
end
