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

class Plc::Task < ActiveRecord::Base
  belongs_to :script_level
  has_and_belongs_to_many :plc_learning_modules, class_name: '::Plc::LearningModule', foreign_key: 'plc_task_id', association_foreign_key: 'plc_learning_module_id'

  attr_readonly :type
end
