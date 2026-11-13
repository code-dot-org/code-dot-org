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
#  key                               :string(255)
#  whiteboard_starter_image_key      :string(255)
#
# Indexes
#
#  index_challenges_on_key        (key) UNIQUE
#  index_challenges_on_lesson_id  (lesson_id)
#
class Challenge < ApplicationRecord
  belongs_to :lesson
  has_many :challenge_responses, dependent: :destroy

  # whiteboard / video / both. 'both' challenges appear in both the whiteboard
  # and video sections of the challenge selector.
  enum default_modality: {
    whiteboard: 'whiteboard',
    video: 'video',
    both: 'both',
  }, _prefix: :default

  # Shared by all environments
  STARTER_IMAGE_BUCKET = 'images.code.org'.freeze

  validates :key, presence: true, uniqueness: true, format: {with: /\A[a-z0-9-]+\z/}
  validates :question, presence: true
  validates :default_modality, presence: true
  validate :rubric_is_gradable
  validate :starter_image_is_described

  def starter_image_s3_key
    "challenge_starter_images/#{whiteboard_starter_image_key}.png"
  end

  # public-read lets servers other than levelbuilder read the object.
  def upload_starter_image(data)
    AWS::S3.upload_to_bucket(
      STARTER_IMAGE_BUCKET,
      starter_image_s3_key,
      data,
      no_random: true,
      content_type: 'image/png',
      acl: 'public-read'
    )
  end

  # Raises AWS::S3::NoSuchKey when the object is missing.
  def download_starter_image
    AWS::S3.download_from_bucket(STARTER_IMAGE_BUCKET, starter_image_s3_key)
  end

  def starter_image_url
    "/challenges/#{id}/starter_image" if whiteboard_starter_image_key.present?
  end

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

  def summarize_for_lesson_edit
    {
      id: id,
      key: key,
      question: question,
      defaultModality: default_modality,
      rubric: rubric,
      whiteboardStarterImageAltText: whiteboard_starter_image_alt_text,
      whiteboardStarterImageUrl: starter_image_url,
    }
  end

  def file_path
    Rails.root.join("config/challenges/#{key}.json")
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(
      file_path,
      JSON.pretty_generate(
        key: key,
        unit_name: lesson.script.name,
        lesson_key: lesson.key,
        question: question,
        default_modality: default_modality,
        rubric: rubric,
        whiteboard_starter_image_key: whiteboard_starter_image_key,
        whiteboard_starter_image_alt_text: whiteboard_starter_image_alt_text,
      )
    )
  end

  # Keeps records with responses, and everything if any file failed to seed.
  def self.seed_all(root_dir: Rails.root, glob: "config/challenges/*.json")
    seeded_keys = []
    failed = false
    Dir.glob(root_dir.join(glob)).each do |path|
      seeded_keys << seed_record(path)
    rescue => exception
      failed = true
      CDO.log.error "Failed to seed challenge #{path}: #{exception.message}"
    end
    return if failed

    where.not(key: seeded_keys).find_each do |challenge|
      if challenge.challenge_responses.exists?
        CDO.log.warn "Keeping challenge #{challenge.id} (#{challenge.key.inspect}): no seed file, but it has responses"
      else
        challenge.destroy!
      end
    end
  end

  def self.seed_record(file_path)
    properties = JSON.parse(File.read(file_path)).symbolize_keys
    unit_name = properties.delete(:unit_name)
    lesson_key = properties.delete(:lesson_key)
    lesson = Lesson.find_by!(script: Unit.find_by!(name: unit_name), key: lesson_key)

    challenge = find_or_initialize_by(key: properties[:key])
    challenge.update!(properties.merge(lesson: lesson))

    challenge.key
  end

  # The shape ChallengeEvaluationPromptHelper reads.
  private def rubric_is_gradable
    unless rubric.is_a?(Array) && rubric.any? && rubric.all?(Hash)
      return errors.add(:rubric, 'must be a non-empty list of levels')
    end
    entries = rubric.map(&:stringify_keys)
    levels = entries.map {|e| e['level']}
    errors.add(:rubric, 'levels must be integers') unless levels.all?(Integer)
    errors.add(:rubric, 'levels must be unique') unless levels.uniq.size == levels.size
    errors.add(:rubric, 'descriptions must not be blank') unless entries.all? {|e| e['description'].is_a?(String) && e['description'].present?}
  end

  private def starter_image_is_described
    if whiteboard_starter_image_key.blank?
      errors.add(:whiteboard_starter_image_alt_text, 'requires a starter image') if whiteboard_starter_image_alt_text.present?
      return
    end
    errors.add(:whiteboard_starter_image_alt_text, 'is required with a starter image') if whiteboard_starter_image_alt_text.blank?
    errors.add(:whiteboard_starter_image_key, 'requires a whiteboard or both modality') unless default_whiteboard? || default_both?
  end
end
