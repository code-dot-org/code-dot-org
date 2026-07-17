# == Schema Information
#
# Table name: challenge_response_assets
#
#  id                    :bigint           not null, primary key
#  challenge_response_id :bigint           not null
#  asset_type            :string(255)      not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_challenge_response_assets_on_challenge_response_id  (challenge_response_id)
#
class ChallengeResponseAsset < ApplicationRecord
  belongs_to :challenge_response

  # whiteboard_image / video / audio.
  enum asset_type: {
    whiteboard_image: 'whiteboard_image',
    video: 'video',
    audio: 'audio',
  }, _prefix: :asset

  validates :asset_type, presence: true

  # How long presigned S3 URLs remain valid.
  URL_EXPIRY = 15.minutes

  # The S3 object key in the user-content bucket. Derived from the record ids
  # (no key is stored), so the asset must be persisted for this to be stable.
  def s3_key
    "challenge_response_assets/#{challenge_response_id}/#{id}"
  end

  # Accepted upload content types per asset_type.
  CONTENT_TYPES = {
    'whiteboard_image' => %w[image/png image/jpeg],
    'video' => %w[video/webm video/mp4],
    'audio' => %w[audio/webm audio/mpeg],
  }.freeze

  # Upper bound on uploaded asset bytes. Uploads stream through dashboard
  # (the user-content bucket has no CORS rules, so the browser cannot PUT
  # to S3 directly). Whiteboard PNGs are capped client-side at 2048px; the
  # headroom is for future video/audio assets. A class method (not a
  # constant) so tests can stub it.
  def self.max_upload_bytes
    50.megabytes
  end

  def accepts_content_type?(content_type)
    CONTENT_TYPES.fetch(asset_type, []).include?(content_type)
  end

  # Stores the asset bytes at this asset's S3 key.
  def upload(data, content_type:)
    AWS::S3.upload_to_bucket(
      AWS::S3.user_content_bucket,
      s3_key,
      data,
      no_random: true,
      content_type: content_type
    )
  end

  # Presigned URL the client GETs the asset bytes from.
  def presigned_download_url
    AWS::S3.presigned_download_url(AWS::S3.user_content_bucket, s3_key, expires_in: URL_EXPIRY.to_i)
  end

  # @param upload [Boolean] when true, the asset was just created and its
  #   bytes are not in S3 yet, so no download URL is included. The client
  #   uploads the bytes via PUT /challenge_response_assets/:id/upload.
  def summarize(upload: false)
    summary = {id: id, asset_type: asset_type}
    summary[:download_url] = presigned_download_url unless upload
    summary
  end
end
