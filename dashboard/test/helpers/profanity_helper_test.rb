require 'test_helper'

class ProfanityHelperTest < ActionView::TestCase
  teardown do
    # Some tests access and store data in the cache, so clear between tests to avoid state leakage
    Rails.cache.clear
  end

  test 'find_profanities: caches and returns profanities from ProfanityFilter' do
    text = 'lots of bad words'
    profanities = ['bad', 'words']
    ProfanityFilter.expects(:find_potential_profanities).once.returns(profanities)

    assert_equal profanities, find_profanities(text, 'en-US')

    # Confirm ProfanityFilter response was cached but ProfanityFilter was not invoked a second time.
    assert_equal profanities, find_profanities(text, 'en-US')
  end

  test 'find_profanities: returns nil if text is not provided' do
    ProfanityFilter.expects(:find_potential_profanities).never

    assert_nil find_profanities('', 'en-US')
  end
end
