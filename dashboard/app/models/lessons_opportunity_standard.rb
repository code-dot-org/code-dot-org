# == Schema Information
#
# Table name: lessons_opportunity_standards
#
#  lesson_id   :bigint           not null
#  standard_id :bigint           not null
#  id          :bigint           not null, primary key
#
# Indexes
#
#  index_lessons_opportunity_standards_on_lesson_id_and_standard_id  (lesson_id,standard_id) UNIQUE
#  index_lessons_opportunity_standards_on_standard_id_and_lesson_id  (standard_id,lesson_id)
#
class LessonsOpportunityStandard < ApplicationRecord
  belongs_to :lesson
  belongs_to :standard

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.select {|l| l.id == lesson_id}.first
    my_standard = seed_context.standards.select {|s| s.id == standard_id}.first
    my_framework = seed_context.frameworks.select {|f| f.id == my_standard.framework_id}.first
    {
      'lesson.key' => my_lesson.key,
      'framework.shortcode' => my_framework.shortcode,
      # make it harder to mistake this for a regular standard
      'opportunity_standard.shortcode' => my_standard.shortcode
    }.stringify_keys
  end
end
