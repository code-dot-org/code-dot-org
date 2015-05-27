# A Cohort is a group of teachers
class Cohort < ActiveRecord::Base
  # A Cohort attends multiple workshops
  has_many :workshops

  # A Cohort is associated with one or more Districts
  has_many :cohorts_districts, inverse_of: :cohort, dependent: :destroy
  has_many :districts, through: :cohorts_districts
  accepts_nested_attributes_for :cohorts_districts, allow_destroy: true

  has_and_belongs_to_many :teachers, class_name: 'User', after_remove: :add_to_deleted_teachers, after_add: [:remove_from_deleted_teachers, :assign_script_to_teacher]

  # when teachers are deleted they are moved here
  has_and_belongs_to_many :deleted_teachers, class_name: 'User', join_table: 'cohorts_deleted_users'

  def add_to_deleted_teachers(teacher)
    deleted_teachers << teacher
  end

  def remove_from_deleted_teachers(teacher)
    deleted_teachers.delete teacher
  end

  def assign_script_to_teacher(teacher)
    return if script.nil?
    UserScript.find_or_create_by(user_id: teacher.id, script_id: script.id) do |user_script|
      user_script.assigned_at = Time.now
      OpsMailer.script_assigned(user: teacher, script: script).deliver
    end
  end

  belongs_to :script
  before_save :assign_script_to_teachers, if: -> {script && script_id_changed?}
  def assign_script_to_teachers
    return if teachers.empty? || script.nil?
    teachers.each do |teacher|
      assign_script_to_teacher(teacher)
    end
  end
end
