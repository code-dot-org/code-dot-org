require_relative '../test_helper'
require 'cdo/profanity_filter'

class ProfanityFilterTest < Minitest::Test
  def test_find_potential_profanities
    # webpurify returns an array
    WebPurify.stubs(:find_potential_profanities).returns(['shit', 'sh1t'])
    assert_equal 'shit', ProfanityFilter.find_potential_profanity('holy shit, sh1t', 'en')

    # webpurify throws an error
    WebPurify.stubs(:find_potential_profanities).raises(OpenURI::HTTPError.new('something broke', 'fake io'))
    assert_raises(OpenURI::HTTPError) do
      ProfanityFilter.find_potential_profanity('holy shit, sh1t', 'en')
    end
  end

  def test_find_potential_profanities
    # webpurify returns an array
    WebPurify.stubs(:find_potential_profanities).returns(['shit'])
    assert_equal ['shit'], ProfanityFilter.find_potential_profanities('holy shit', 'en')

    # webpurify throws an error
    WebPurify.stubs(:find_potential_profanities).raises(OpenURI::HTTPError.new('something broke', 'fake io'))
    assert_raises(OpenURI::HTTPError) do
      ProfanityFilter.find_potential_profanities('holy shit', 'en')
    end
  end
end
