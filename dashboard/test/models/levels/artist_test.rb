require 'test_helper'

class ArtistTest < ActiveSupport::TestCase
  def setup
    @artist = Artist.new
  end

  test 'uses_google_blockly? returns true when DCDO flag is true' do
    DCDO.stubs(:get).with('artist_google_blockly', true).returns(true)
    assert @artist.uses_google_blockly?
  end

  test 'uses_google_blockly? returns false when DCDO flag is false' do
    DCDO.stubs(:get).with('artist_google_blockly', true).returns(false)
    refute @artist.uses_google_blockly?
  end
end
