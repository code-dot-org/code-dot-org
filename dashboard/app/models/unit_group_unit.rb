# == Schema Information
#
# Table name: course_scripts
#
#  id                :integer          not null, primary key
#  course_id         :integer          not null
#  script_id         :integer          not null
#  position          :integer          not null
#  experiment_name   :string(255)
#  default_script_id :integer
#
# Indexes
#
#  index_course_scripts_on_course_id          (course_id)
#  index_course_scripts_on_default_script_id  (default_script_id)
#  index_course_scripts_on_script_id          (script_id)
#

class UnitGroupUnit < ApplicationRecord
  self.table_name = 'course_scripts'

  belongs_to :unit_group, foreign_key: 'course_id'
  belongs_to :script

  # The script will replace the default_script when the user has
  # the experiment_name enabled.
  belongs_to :default_script, class_name: 'Script'

  def self.experiments
    Rails.cache.fetch("course_script_experiments") do
      UnitGroupUnit.where.not(experiment_name: nil).map(&:experiment_name)
    end
  end
end
