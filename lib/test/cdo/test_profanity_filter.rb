require_relative '../test_helper'
require 'cdo/profanity_filter'

class ProfanityFilterTest < Minitest::Test
  def setup
    @expletive1 = 'badword'
    @expletive2 = 'realbadword'
  end

  def test_find_potential_profanity
    WebPurify.stubs(:find_potential_profanities).returns([@expletive1, @expletive2])
    assert_equal @expletive1, ProfanityFilter.find_potential_profanity("holy #{@expletive1}, #{@expletive2}", 'en')

    # WebPurify throws an error
    WebPurify.stubs(:find_potential_profanities).raises(OpenURI::HTTPError.new('something broke', 'fake io'))
    assert_raises(OpenURI::HTTPError) do
      ProfanityFilter.find_potential_profanity("holy #{@expletive1}, #{@expletive2}", 'en')
    end

    WebPurify.unstub(:find_potential_profanities)
  end

  def test_find_potential_profanities
    WebPurify.stubs(:find_potential_profanities).returns([@expletive1])
    assert_equal [@expletive1], ProfanityFilter.find_potential_profanities("holy #{@expletive1}", 'en')

    # WebPurify throws an error
    WebPurify.stubs(:find_potential_profanities).raises(OpenURI::HTTPError.new('something broke', 'fake io'))
    assert_raises(OpenURI::HTTPError) do
      ProfanityFilter.find_potential_profanities("holy #{@expletive1}", 'en')
    end

    WebPurify.unstub(:find_potential_profanities)
  end

  def test_find_potential_profanities_allowlist
    WebPurify.stubs(:find_potential_profanities).returns(nil)

    # 'fu' is blocked for all languages except Italian.
    assert_equal ['fu'], ProfanityFilter.find_potential_profanities('oh fu', 'en')
    assert_nil ProfanityFilter.find_potential_profanities('tofu', 'en') # Superset of 'fu' should be allowed.
    assert_nil ProfanityFilter.find_potential_profanities('fu', 'it')

    # 'fick' is blocked for all languages except Swedish.
    assert_equal ['fick'], ProfanityFilter.find_potential_profanities('oh fick', 'en')
    assert_nil ProfanityFilter.find_potential_profanities('fickle', 'en') # Superset of 'fick' should be allowed.
    assert_nil ProfanityFilter.find_potential_profanities('fick', 'sv')

    WebPurify.unstub(:find_potential_profanities)
  end

  def test_find_potential_profanities_locale
    spanish_expletive = 'uhoh'
    WebPurify.stubs(:find_potential_profanities).with(spanish_expletive, ['en', 'es']).returns([spanish_expletive])

    assert_equal [spanish_expletive], ProfanityFilter.find_potential_profanities(spanish_expletive, 'es')
    assert_equal [spanish_expletive], ProfanityFilter.find_potential_profanities(spanish_expletive, 'es-MX')
    assert_equal [spanish_expletive], ProfanityFilter.find_potential_profanities(spanish_expletive, 'es-ES')

    WebPurify.unstub(:find_potential_profanities)
  end
end
