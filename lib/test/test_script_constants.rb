require_relative '../../lib/cdo/script_constants'
require 'minitest/autorun'

class ScriptConstantsTest < Minitest::Test
  def test_congrats_page
    %w(
      coursea-2019
      courseb-2019
      coursec-2019
      coursed-2019
      coursee-2019
      coursef-2019
      express-2019
      pre-express-2019
      coursea-2020
      courseb-2020
      coursec-2020
      coursed-2020
      coursee-2020
      coursef-2020
      express-2020
      pre-express-2020
    ).each do |script_name|
      assert ScriptConstants.has_congrats_page?(script_name), "#{script_name} should have congrats page"
    end
  end

  def test_csf_next_course_recommendation
    {
      "course1" => "course2",
      "course2" => "course3",
      "course3" => "course4",
      "accelerated" => "course4",
      "course4" => "applab",

      "coursea-2019" => "courseb-2019",
      "courseb-2019" => "coursec-2019",
      "coursec-2019" => "coursed-2019",
      "coursed-2019" => "coursee-2019",
      "coursee-2019" => "coursef-2019",
      "pre-express-2019" => "coursec-2019",
      "coursef-2019" => "applab",
      "express-2019" => "applab",

      "coursea-2020" => "courseb-2020",
      "courseb-2020" => "coursec-2020",
      "coursec-2020" => "coursed-2020",
      "coursed-2020" => "coursee-2020",
      "coursee-2020" => "coursef-2020",
      "pre-express-2020" => "coursec-2020",
      "coursef-2020" => "applab",
      "express-2020" => "applab",
    }.each do |course_name, expected|
      assert_equal expected, ScriptConstants.csf_next_course_recommendation(course_name), "course: #{course_name}"
    end

    assert_nil ScriptConstants.csf_next_course_recommendation("something-unknown")
  end

  describe 'ScriptConstants::i18n' do
    it 'finds course1 in i18n' do
      assert ScriptConstants.i18n?('course1')
    end
  end
end
