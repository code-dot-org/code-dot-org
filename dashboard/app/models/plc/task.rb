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

# A thing that someone who is trying to complete a learning module must do.
# Ex: a written lesson plan, completing a given script.
# A module will have one or more tasks to complete. Every task belongs to exactly one module.
#
# Some examples of task types are:
#   Script Completion Tasks - completed when a user finishes a given script in code studio
#   Written Assignment Tasks - completed when a user submits some writing
#     Some of these will be reviewed by instructors, some of these will be reviewed by peers
#   Learning Resources - Although these are not tasks, it makes sense to model them as such.
#     These are links to external sites or videos that a user may find useful. There's no
#     concept of "completing" these (yet) but they should show up as items a user should do.
#
# Tasks correspond to ScriptLevels in our regular curriculum hierarchy.
class Plc::Task < ActiveRecord::Base
  attr_readonly :type

  belongs_to :script_level
  has_and_belongs_to_many :plc_learning_modules, class_name: '::Plc::LearningModule', foreign_key: 'plc_task_id', association_foreign_key: 'plc_learning_module_id'
end
