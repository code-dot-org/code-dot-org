class AddSubjectToCsfPdWorkshops < ActiveRecord::Migration[5.0]
  def up
    # All existing CSF workshops now get subject 101
    Pd::Workshop.
      where(course: Pd::Workshop::COURSE_CSF).
      update_all(subject: Pd::Workshop::SUBJECT_CSF_101)
  end

  def down
    # Remove subject
    Pd::Workshop.
      where(course: Pd::Workshop::COURSE_CSF).
      update_all(subject: nil)
  end
end
