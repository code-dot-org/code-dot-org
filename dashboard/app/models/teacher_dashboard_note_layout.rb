class TeacherDashboardNoteLayout < ApplicationRecord
  belongs_to :teacher_dashboard_note
  belongs_to :teacher, class_name: 'User'

  validates :note_layout_column, inclusion: {in: [0, 1]}
  validates :note_position, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :teacher_dashboard_note_id, uniqueness: {scope: :teacher_id}
  validate :teacher_can_view_note

  private def teacher_can_view_note
    return if teacher.blank? || teacher_dashboard_note.blank?
    return if teacher_dashboard_note.visible_to?(teacher)

    errors.add(:teacher_dashboard_note_id, 'must be visible to the teacher')
  end
end
