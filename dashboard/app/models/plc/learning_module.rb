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

# A component of a course, like "Internet Safety" or "What are loops?"
# Modules are independent of courses. Two people taking the same course may have different modules
# to complete. Additionally, some modules will be part of multiple courses. So courses are not
# part of modules, and modules are not part of courses.
# Learning Modules correspond to Lessons in our regular curriculum hierarchy.
class Plc::LearningModule < ApplicationRecord
  MODULE_TYPES = [
    REQUIRED_MODULE = 'required'.freeze,
    CONTENT_MODULE = 'content'.freeze,
    PRACTICE_MODULE = 'practice'.freeze,
    REVIEW_MODULE = 'peer'.freeze
  ].freeze

  RESERVED_LESSON_GROUPS_FOR_PLC = [
    {key: REQUIRED_MODULE, display_name: 'Overview'},
    {key: CONTENT_MODULE, display_name: 'Content'},
    {key: PRACTICE_MODULE, display_name: 'Teaching Practices'},
    {key: REVIEW_MODULE, display_name: 'Peer Review'},
  ].freeze

  NONREQUIRED_MODULE_TYPES = (MODULE_TYPES - [REQUIRED_MODULE]).freeze

  attr_readonly :plc_course_unit_id

  belongs_to :lesson, foreign_key: 'stage_id'
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_unit_id'
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_learning_module_id', dependent: :destroy

  validates_presence_of :plc_course_unit_id
  validates_inclusion_of :module_type, in: MODULE_TYPES

  scope :required, -> {where(module_type: REQUIRED_MODULE)}
  scope :content, -> {where(module_type: CONTENT_MODULE)}
  scope :practice, -> {where(module_type: PRACTICE_MODULE)}

  def required?
    module_type == REQUIRED_MODULE
  end
end
