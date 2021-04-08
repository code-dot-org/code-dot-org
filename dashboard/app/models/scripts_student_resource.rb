# == Schema Information
#
# Table name: scripts_student_resources
#
#  id          :bigint           not null, primary key
#  script_id   :integer
#  resource_id :integer
#
# Indexes
#
#  index_scripts_student_resources_on_resource_id_and_script_id  (resource_id,script_id)
#  index_scripts_student_resources_on_script_id_and_resource_id  (script_id,resource_id) UNIQUE
#
class ScriptsStudentResource < ApplicationRecord
  belongs_to :script
  belongs_to :resource

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
    my_resource = seed_context.resources.select {|r| r.id == resource_id}.first
    my_key = {'resource.key': my_resource.key}
    script_seeding_key = seed_context.script.seeding_key(seed_context)

    my_key.merge!(script_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key.stringify_keys
  end
end
