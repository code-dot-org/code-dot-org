# Plc::EnrollmentUnitAssignment represents a user's enrollment in a specific course unit
# == Schema Information
#
# Table name: plc_enrollment_unit_assignments
#
#  id                            :integer          not null, primary key
#  plc_user_course_enrollment_id :integer
#  plc_course_unit_id            :integer
#  status                        :string(255)
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  user_id                       :integer
#
# Indexes
#
#  enrollment_unit_assignment_course_enrollment_index  (plc_user_course_enrollment_id)
#  enrollment_unit_assignment_course_unit_index        (plc_course_unit_id)
#  index_plc_enrollment_unit_assignments_on_user_id    (user_id)
#

class Plc::EnrollmentUnitAssignment < ActiveRecord::Base
  belongs_to :plc_user_course_enrollment, class_name: '::Plc::UserCourseEnrollment'
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit'
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_enrollment_unit_assignment_id', dependent: :destroy
  belongs_to :user, class_name: 'User'

  UNIT_STATUS_STATES = [
    START_BLOCKED = 'start_blocked'.freeze,
    IN_PROGRESS = 'in_progress'.freeze,
    COMPLETED = 'completed'.freeze
  ].freeze

  after_save :enroll_user_in_required_modules

  validates :status, inclusion: {in: UNIT_STATUS_STATES}

  def module_assignment_for_type(module_type)
    plc_module_assignments.joins(:plc_learning_module).find_by('plc_learning_modules.module_type': module_type)
  end

  def enroll_user_in_required_modules
    transaction do
      plc_course_unit.plc_learning_modules.required.each do |required_module|
        enroll_in_module required_module
      end
    end
  end

  def unlock_unit
    update(status: IN_PROGRESS)
  end

  def enroll_user_in_unit_with_learning_modules(learning_modules)
    transaction do
      Plc::LearningModule::NONREQUIRED_MODULE_TYPES.each do |module_type|
        module_assignment_for_type(module_type).try(:destroy)
      end

      learning_modules.each do |learning_module|
        enroll_in_module learning_module
      end

      update!(status: IN_PROGRESS)
    end
  end

  def focus_area_stage_ids
    plc_module_assignments.map {|a| a.plc_learning_module.stage.id unless a.plc_learning_module.required?}.compact
  end

  def summarize_progress
    summary = []

    categories_for_stage = plc_course_unit.script.stages.map(&:flex_category).uniq

    # If the course unit has an evaluation level, then status is determined by the completion of the focus group modules
    if plc_course_unit.has_evaluation?
      Plc::LearningModule::MODULE_TYPES.select {|type| categories_for_stage.include?(type)}.each do |flex_category|
        module_category = flex_category || Plc::LearningModule::CONTENT_MODULE
        category_name = I18n.t("flex_category.#{module_category}")
        summary << {
          category: category_name,
          status: module_assignment_for_type(flex_category).try(:status) || Plc::EnrollmentModuleAssignment::NOT_STARTED,
          link: Rails.application.routes.url_helpers.script_path(plc_course_unit.script, anchor: category_name.downcase.tr(' ', '-'))
        }
      end
    else
      # Otherwise, status is determined by the completion of stages
      categories_for_stage.each do |category|
        summary << {
          category: I18n.t("flex_category.#{category || 'content'}"),
          status: Plc::EnrollmentModuleAssignment.stages_based_status(
            plc_course_unit.script.stages.select {|stage| stage.flex_category == category},
            user,
            plc_course_unit.script
          ),
          link: Rails.application.routes.url_helpers.script_path(plc_course_unit.script)
        }
      end
    end

    # If there are peer reviews, summarize that progress as well
    if plc_course_unit.script.has_peer_reviews?
      summary << {
        category: I18n.t('flex_category.peer_review'),
        status: PeerReview.get_review_completion_status(user, plc_course_unit.script),
        link: Rails.application.routes.url_helpers.script_path(plc_course_unit.script, anchor: 'peer-review')
      }
    end

    summary
  end

  private

  def enroll_in_module(learning_module)
    return unless learning_module.plc_course_unit == plc_course_unit

    Plc::EnrollmentModuleAssignment.find_or_create_by(
      plc_enrollment_unit_assignment: self,
      plc_learning_module: learning_module,
      user: user
    )
  end
end
