require 'test_helper'

class RacesTest < ActiveSupport::TestCase
  test 'any_urm? with nil' do
    assert_nil Race.any_urm?(nil)
  end

  test 'any_urm? with empty string' do
    assert_nil Race.any_urm?('')
  end

  test 'any_urm? with non-answer responses' do
    %w(opt_out nonsense closed_dialog).each do |response|
      assert_nil Race.any_urm?(response)
    end
  end

  test 'any_urm? with urm responses' do
    ['white,black', 'hispanic,hawaiian', 'american_indian'].each do |response|
      assert Race.any_urm?(response)
    end
  end

  test 'any_urm? with non-urm response' do
    ['white', 'white,asian', 'asian'].each do |response|
      refute Race.any_urm?(response)
    end
  end
end
