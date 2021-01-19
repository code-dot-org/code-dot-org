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
    assert ScriptConstants.script_in_category?(:minecraft, ScriptConstants::MINECRAFT_NAME)
    refute ScriptConstants.script_in_category?(:minecraft, ScriptConstants::FROZEN_NAME)
  end

  def test_flappy?
    assert ScriptConstants.script_in_category?(:flappy, ScriptConstants::FLAPPY_NAME)
    refute ScriptConstants.script_in_category?(:flappy, ScriptConstants::FROZEN_NAME)
  end

  def test_hoc?
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::HOC_2013_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::HOC_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::FROZEN_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::FLAPPY_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::PLAYLAB_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::STARWARS_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::STARWARS_BLOCKS_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::MINECRAFT_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::MINECRAFT_AQUATIC_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::INFINITY_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::ARTIST_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::GUMBALL_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::ICEAGE_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::DANCE_PARTY_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::DANCE_PARTY_EXTRAS_NAME)
    assert ScriptConstants.script_in_category?(:hoc, ScriptConstants::OCEANS_NAME)
    refute ScriptConstants.script_in_category?(:hoc, ScriptConstants::COURSE4_NAME)
  end

  def test_category
    assert_equal ['hoc'], ScriptConstants.categories(ScriptConstants::HOC_NAME)
    assert_equal ['hoc'], ScriptConstants.categories(ScriptConstants::STARWARS_NAME)
    assert_equal ['hoc', 'flappy'], ScriptConstants.categories(ScriptConstants::FLAPPY_NAME)
    assert_equal ['csf_international'], ScriptConstants.categories(ScriptConstants::COURSE1_NAME)
    assert_equal ['csp'], ScriptConstants.categories(ScriptConstants::CSP_UNIT1_NAME)
  end

  def test_category_index
    assert_equal 0, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT1_NAME, :csp)
    assert_equal 1, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT2_NAME, :csp)
    assert_equal 2, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT3_NAME, :csp)
    assert_equal 3, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT4_NAME, :csp)
    assert_equal 4, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT5_NAME, :csp)
    assert_equal 5, ScriptConstants.position_in_category(ScriptConstants::CSP_UNIT6_NAME, :csp)

    assert_nil ScriptConstants.position_in_category('script', :not_a_category)
    assert_nil ScriptConstants.position_in_category('not a script', :csp)
  end

  def test_category_priority
    assert_equal 5, ScriptConstants.category_priority(:csf_international)
    assert_equal 7, ScriptConstants.category_priority(:research_studies)
  end

  def test_assignable_info
    assert_equal 1, ScriptConstants.assignable_info({name: 'dance-2019'})[:position]
    assert_equal 2, ScriptConstants.assignable_info({name: 'dance-extras-2019'})[:position]
    assert_equal 3, ScriptConstants.assignable_info({name: 'oceans'})[:position]
    assert_equal 4, ScriptConstants.assignable_info({name: 'aquatic'})[:position]
    assert_equal 5, ScriptConstants.assignable_info({name: 'hero'})[:position]
    assert_equal 6, ScriptConstants.assignable_info({name: 'mc'})[:position]
    assert_equal 7, ScriptConstants.assignable_info({name: 'minecraft'})[:position]
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

  describe 'ScriptConstants::script_in_any_category?' do
    it 'finds artist and csd1' do
      assert ScriptConstants.script_in_any_category?('artist')
      assert ScriptConstants.script_in_any_category?('csd1-2017')
    end

    it 'does not find nonexistent scripts' do
      refute ScriptConstants.script_in_any_category?('foo')
    end
  end

  describe 'ScriptConstants::i18n' do
    it 'finds course1 in i18n' do
      assert ScriptConstants.i18n?('course1')
    end
  end
end
