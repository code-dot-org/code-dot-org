# == Schema Information
#
# Table name: vocabularies
#
#  id                :bigint           not null, primary key
#  key               :string(255)      not null
#  word              :string(255)      not null
#  definition        :text(65535)      not null
#  course_version_id :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  properties        :text(65535)
#
# Indexes
#
#  index_vocabularies_on_key_and_course_version_id  (key,course_version_id) UNIQUE
#  index_vocabularies_on_word_and_definition        (word,definition)
#
class Vocabulary < ApplicationRecord
  include SerializedProperties

  has_and_belongs_to_many :lessons, join_table: :lessons_vocabularies
  belongs_to :course_version

  KEY_CHAR_RE = /[a-z_]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only lowercase alphabetic characters and underscores; got \"%{value}\"."

  before_validation :generate_key, on: :create

  validate :check_readonly_fields, on: :update

  serialized_attrs %w(
    common_sense_media
  )

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] _seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(_seed_context)
    # Course version is also needed to identify this object, and can be looked
    # up from the script/unit which this vocabulary is serialized within. If we
    # were to serialize vocabulary outside of .script_json, we'd need to include
    # a key respresenting the course version here.
    {'vocabulary.key': key}.stringify_keys
  end

  def summarize_for_lesson_show
    {
      key: key,
      word: get_localized_property(:word),
      definition: get_localized_property(:definition),
    }
  end

  def summarize_for_lesson_edit
    {
      id: id,
      key: key,
      markdownKey: Services::GloballyUniqueIdentifiers.build_vocab_key(self),
      word: word,
      definition: definition,
      commonSenseMedia: !!common_sense_media
    }
  end

  def summarize_for_edit
    {
      id: id,
      key: key,
      word: word,
      definition: definition,
      lessons: lessons.map(&:id),
      commonSenseMedia: !!common_sense_media
    }
  end

  def generate_key
    return if key
    key = common_sense_media ? "#{word}_csm" : word
    key = Vocabulary.sanitize_key(key)
    self.key = key
  end

  # Return a sanitized copy of the given key with all invalid characters
  # replaced with valid equivalents.
  def self.sanitize_key(key)
    key.strip.downcase.chars.map do |character|
      KEY_CHAR_RE.match(character) ? character : '_'
    end.join.squeeze('_')
  end

  # Return a version of the given key which does not conflict
  # with any existing key for the given CourseVersion. We
  # achieve this through basic guess-and-check; simply append an
  # arbitrary incrementable value, and increment it until we
  # find one that works.
  #
  # NOTE that this is not currently used in production; it's
  # currently only used by the ScriptSeedTest, to deal with
  # the complex seeding logic used in that test.
  def self.uniquify_key(key, course_version_id)
    new_key = key.dup
    suffix = 'a'

    while Vocabulary.exists?(key: new_key, course_version_id: course_version_id)
      new_key = "#{key}_#{suffix}"
      suffix = suffix.next
    end

    new_key
  end

  def serialize_scripts
    if Rails.application.config.levelbuilder_mode
      lessons.map(&:script).uniq.each(&:write_script_json)
    end
  end

  def copy_to_course_version(destination_course_version)
    return self if course_version == destination_course_version
    persisted_vocab = Vocabulary.where(word: word, course_version_id: destination_course_version.id).first
    if persisted_vocab && !!persisted_vocab.common_sense_media == !!common_sense_media
      persisted_vocab
    else
      copied_vocab = Vocabulary.create!(word: word, definition: definition, common_sense_media: common_sense_media, course_version_id: destination_course_version.id)
      copied_vocab
    end
  end

  private

  # A simple helper function to encapsulate creating a unique key, since this
  # model does not have a unique identifier field of its own.
  def get_localized_property(property_name)
    key = Services::GloballyUniqueIdentifiers.build_vocab_key(self)
    Services::I18n::CurriculumSyncUtils.get_localized_property(self, property_name, key)
  end

  def check_readonly_fields
    errors.add(:word, "cannot be updated") if word_changed?
    errors.add(:definition, "cannot be updated for common sense media vocabulary") if common_sense_media && definition_changed?
  end
end
