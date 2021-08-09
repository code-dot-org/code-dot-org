# == Schema Information
#
# Table name: stages_standards
#
#  stage_id    :integer          not null
#  standard_id :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_stages_standards_on_stage_id     (stage_id)
#  index_stages_standards_on_standard_id  (standard_id)
#
class LessonsStandard < ApplicationRecord
  self.table_name = 'stages_standards'

  belongs_to :lesson, foreign_key: 'stage_id'
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
    my_lesson = seed_context.lessons.select {|l| l.id == stage_id}.first
    my_standard = seed_context.standards.select {|s| s.id == standard_id}.first
    my_framework = seed_context.frameworks.select {|f| f.id == my_standard.framework_id}.first
    {
      'lesson.key' => my_lesson.key,
      'framework.shortcode' => my_framework.shortcode,
      'standard.shortcode' => my_standard.shortcode
    }.stringify_keys
  end
end
