class TeacherDashboardNoteSharedSection < ApplicationRecord
  belongs_to :teacher_dashboard_note
  belongs_to :section

  validates :section_id, uniqueness: {scope: :teacher_dashboard_note_id}
end
