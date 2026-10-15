require 'test_helper'

class ChallengeResponseAssetTest < ActiveSupport::TestCase
  describe '#s3_key' do
    it 'carries a .png extension for whiteboard images' do
      asset = create(:challenge_response_asset, asset_type: 'whiteboard_image')

      _(asset.s3_key).must_equal "challenge_response_assets/#{asset.challenge_response_id}/#{asset.id}.png"
    end

    it 'has no extension for other asset types' do
      asset = create(:challenge_response_asset, asset_type: 'video')

      _(asset.s3_key).must_equal "challenge_response_assets/#{asset.challenge_response_id}/#{asset.id}"
    end
  end

  describe '#accepts_content_type?' do
    it 'accepts only PNG for whiteboard images' do
      asset = create(:challenge_response_asset, asset_type: 'whiteboard_image')

      _(asset.accepts_content_type?('image/png')).must_equal true
      _(asset.accepts_content_type?('image/jpeg')).must_equal false
    end
  end
end
