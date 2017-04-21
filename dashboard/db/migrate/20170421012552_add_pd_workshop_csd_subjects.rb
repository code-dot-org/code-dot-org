class AddPdWorkshopCsdSubjects < ActiveRecord::Migration[5.0]
  def up
    # Any existing CSD workshops get the first subject
    Pd::Workshop.where(course: Pd::Workshop::COURSE_CSD).update_all(
      subject: Pd::Workshop::SUBJECTS[Pd::Workshop::COURSE_CSD].first
    )
  end

  def down
    Pd::Workshop.where(course: Pd::Workshop::COURSE_CSD).update_all(subject: nil)
  end
end
