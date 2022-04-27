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

  def test_find_potential_profanities_replace_text_list
    # Ensure that when ProfanityFilter.find_potential_profanities is called with text_original,
    # that it calls WebPurify.find_potential_profanities with text_word_removed.
    # Note that because it only replaces standalone words, "replacenah" will not be replaced.
    # Also note that text_word_removed has two spaces in it because we remove standalone words,
    # leaving two spaces surrounding the place where the word used to be.

    text_original = 'testing replace replacenah testing'
    text_word_removed = 'testing  replacenah testing'
    word_to_remove = 'replace'

    WebPurify.stubs(:find_potential_profanities).with(text_word_removed, ['en', 'en']).returns([word_to_remove])

    assert_equal [word_to_remove], ProfanityFilter.find_potential_profanities(text_original, 'en', {word_to_remove => ''})

    WebPurify.unstub(:find_potential_profanities)
  end

  def test_nil_text
    WebPurify.stubs(:find_potential_profanities).with(nil, ['en', 'en']).returns(nil)

    assert_nil ProfanityFilter.find_potential_profanities(nil, 'en')

    WebPurify.unstub(:find_potential_profanities)
  end
end
