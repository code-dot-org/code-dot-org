# == Schema Information
#
# Table name: challenges
#
#  id                                :bigint           not null, primary key
#  lesson_id                         :integer          not null
#  question                          :text(65535)      not null
#  default_modality                  :string(255)
#  whiteboard_starter_image_alt_text :text(65535)
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#  rubric                            :json
#
# Indexes
#
#  index_challenges_on_lesson_id  (lesson_id)
#
class Challenge < ApplicationRecord
  belongs_to :lesson
  has_many :challenge_responses, dependent: :destroy

  # whiteboard / video. Null = no default modality for this challenge.
  enum default_modality: {
    whiteboard: 'whiteboard',
    video: 'video',
  }, _prefix: :default

  validates :question, presence: true

  # How long presigned starter-image URLs remain valid.
  STARTER_IMAGE_URL_EXPIRY = 15.minutes

  # The S3 object key for this challenge's whiteboard starter image, in the
  # user-content bucket. Derived from the id (no key is stored), so the
  # challenge must be persisted for the key to be stable. Starter images are
  # PNG, matching the whiteboard snapshots in ChallengeResponseAsset.
  def starter_image_s3_key
    "challenge_starter_images/#{id}.png"
  end

  # Stores the starter image bytes at this challenge's S3 key. Bytes must be
  # PNG; whiteboard_starter_image_alt_text should be set alongside so callers
  # know an image exists (see the create_challenge_tables migration).
  def upload_starter_image(data, content_type: 'image/png')
    AWS::S3.upload_to_bucket(
      AWS::S3.user_content_bucket,
      starter_image_s3_key,
      data,
      no_random: true,
      content_type: content_type
    )
  end

  # True once starter image bytes exist in S3. A non-null
  # whiteboard_starter_image_alt_text is the cheap signal; this is the
  # authoritative check.
  def starter_image_uploaded?
    AWS::S3.exists_in_bucket(AWS::S3.user_content_bucket, starter_image_s3_key)
  end

  # The raw starter image bytes from S3. Raises AWS::S3::NoSuchKey when no
  # image was uploaded; ChallengesController#starter_image maps that to 404.
  def download_starter_image
    AWS::S3.download_from_bucket(AWS::S3.user_content_bucket, starter_image_s3_key)
  end

  # Same-origin path the client loads the starter image from, or nil when this
  # challenge has none. Serving through dashboard (rather than a presigned S3
  # URL) keeps the image same-origin, so html-to-image can fold it into the
  # whiteboard submission snapshot without a CORS taint.
  def starter_image_url
    "/challenges/#{id}/starter_image" if whiteboard_starter_image_alt_text.present?
  end

  # Presigned URL the client GETs the starter image bytes from.
  def starter_image_download_url
    AWS::S3.presigned_download_url(
      AWS::S3.user_content_bucket,
      starter_image_s3_key,
      expires_in: STARTER_IMAGE_URL_EXPIRY.to_i
    )
  end

  # The frontend-facing shape of a challenge.
  def summarize
    {
      id: id,
      lesson_id: lesson_id,
      question: question,
      default_modality: default_modality,
      whiteboard_starter_image_alt_text: whiteboard_starter_image_alt_text,
      whiteboard_starter_image_url: starter_image_url,
    }
  end
end
