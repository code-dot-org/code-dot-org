require 'test_helper'

class ArtistTest < ActiveSupport::TestCase
  def setup
    @artist = Artist.new
  end

  test 'uses_google_blockly? returns true' do
    assert @artist.uses_google_blockly?
  end
end
