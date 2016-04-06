# == Schema Information
#
# Table name: plc_enrollment_module_assignments
#
#  id                                :integer          not null, primary key
#  plc_enrollment_unit_assignment_id :integer
#  plc_learning_module_id            :integer
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#
# Indexes
#
#  module_assignment_enrollment_index  (plc_enrollment_unit_assignment_id)
#  module_assignment_lm_index          (plc_learning_module_id)
#

class Plc::EnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :plc_enrollment_unit_assignment, class_name: '::Plc::EnrollmentUnitAssignment'
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
  has_many :plc_task_assignments, class_name: '::Plc::EnrollmentTaskAssignment', foreign_key: 'plc_enrollment_module_assignment_id', dependent: :destroy

  validates :plc_enrollment_unit_assignment, presence: true
  validates :plc_learning_module, presence: true
end
