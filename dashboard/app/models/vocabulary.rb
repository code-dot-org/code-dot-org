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
#
# Indexes
#
#  index_vocabularies_on_key_and_course_version_id  (key,course_version_id) UNIQUE
#  index_vocabularies_on_word_and_definition        (word,definition)
#
class Vocabulary < ApplicationRecord
  has_and_belongs_to_many :lessons, join_table: :lessons_vocabularies
  has_many :lessons_vocabularies
  belongs_to :course_version

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_json for more context.
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
    {key: key, word: display_word, definition: display_definition}
  end

  private

  def display_word
    word
  end

  def display_definition
    definition
  end
end
