# == Schema Information
#
# Table name: plc_tasks
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  type            :string(255)      default("Plc::Task"), not null
#  properties      :text(65535)
#  script_level_id :integer
#
# Indexes
#
#  index_plc_tasks_on_script_level_id  (script_level_id)
#

class Plc::LearningResourceTask < Plc::Task
  serialized_attrs %w(resource_url icon)
end
