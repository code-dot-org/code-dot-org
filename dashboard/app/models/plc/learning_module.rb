# == Schema Information
#
# Table name: plc_learning_modules
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  plc_course_unit_id :integer          not null
#  module_type        :string(255)
#  stage_id           :integer
#
# Indexes
#
#  index_plc_learning_modules_on_plc_course_unit_id  (plc_course_unit_id)
#  index_plc_learning_modules_on_stage_id            (stage_id)
#

class Plc::LearningModule < ActiveRecord::Base
  belongs_to :stage
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_unit_id'
  has_and_belongs_to_many :plc_tasks, class_name: '::Plc::Task', foreign_key: 'plc_learning_module_id', association_foreign_key: 'plc_task_id'
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_learning_module_id', dependent: :destroy

  MODULE_TYPES = [
      REQUIRED_MODULE = 'required',
      CONTENT_MODULE = 'content',
      PRACTICE_MODULE = 'practice'
  ]

  NONREQUIRED_MODULE_TYPES = MODULE_TYPES - [REQUIRED_MODULE]

  validates_presence_of :plc_course_unit_id
  validates :module_type, inclusion: {in: MODULE_TYPES}

  attr_readonly :plc_course_unit_id

  scope :required, -> { where(module_type: REQUIRED_MODULE) }
  scope :content, -> { where(module_type: CONTENT_MODULE) }
  scope :practice, -> { where(module_type: PRACTICE_MODULE) }

  def is_required?
    module_type == REQUIRED_MODULE
  end

  def name_with_required_tag
    "#{name}#{' - Required' if is_required?}"
  end
end
