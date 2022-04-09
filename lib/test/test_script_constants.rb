require_relative '../../lib/cdo/script_constants'
require 'minitest/autorun'

class ScriptConstantsTest < Minitest::Test
  def test_name_constant
    assert_equal 'starwars', ScriptConstants::STARWARS_NAME
    assert_equal 'starwarsblocks', ScriptConstants::STARWARS_BLOCKS_NAME
    assert_equal 'mc', ScriptConstants::MINECRAFT_NAME
    assert_equal 'hourofcode', ScriptConstants::HOC_NAME
    assert_equal 'frozen', ScriptConstants::FROZEN_NAME
    assert_equal 'flappy', ScriptConstants::FLAPPY_NAME
  end

  def test_minecraft?
    assert ScriptConstants.unit_in_category?(:minecraft, ScriptConstants::MINECRAFT_NAME)
    refute ScriptConstants.unit_in_category?(:minecraft, ScriptConstants::FROZEN_NAME)
  end

  def test_flappy?
    assert ScriptConstants.unit_in_category?(:flappy, ScriptConstants::FLAPPY_NAME)
    refute ScriptConstants.unit_in_category?(:flappy, ScriptConstants::FROZEN_NAME)
  end

  def test_hoc?
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::HOC_2013_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::HOC_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::FROZEN_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::FLAPPY_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::PLAYLAB_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::STARWARS_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::STARWARS_BLOCKS_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::MINECRAFT_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::MINECRAFT_AQUATIC_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::INFINITY_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::ARTIST_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::GUMBALL_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::ICEAGE_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::DANCE_PARTY_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::DANCE_PARTY_EXTRAS_NAME)
    assert ScriptConstants.unit_in_category?(:hoc, ScriptConstants::OCEANS_NAME)
    refute ScriptConstants.unit_in_category?(:hoc, ScriptConstants::COURSE4_NAME)
  end

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
