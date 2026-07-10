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

  # Presigned URL the client PUTs the asset bytes to. Used right after create,
  # before the object exists in S3.
  def presigned_upload_url
    AWS::S3.presigned_upload_url(AWS::S3.user_content_bucket, s3_key, expires_in: URL_EXPIRY.to_i)
  end

  # Presigned URL the client GETs the asset bytes from.
  def presigned_download_url
    AWS::S3.presigned_download_url(AWS::S3.user_content_bucket, s3_key, expires_in: URL_EXPIRY.to_i)
  end

  # @param upload [Boolean] when true, include an upload URL (object not yet in
  #   S3); otherwise include a download URL.
  def summarize(upload: false)
    summary = {id: id, asset_type: asset_type}
    summary[upload ? :upload_url : :download_url] =
      upload ? presigned_upload_url : presigned_download_url
    summary
  end
end
