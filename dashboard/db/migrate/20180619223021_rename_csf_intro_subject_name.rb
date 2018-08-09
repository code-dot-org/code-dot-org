class RenameCsfIntroSubjectName < ActiveRecord::Migration[5.0]
  CSF_COURSE = 'CS Fundamentals'.freeze
  CSF_SUBJECTS = [
    {from: 'Intro Workshop', to: 'Intro'},
  ].freeze

  def up
    CSF_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSF_COURSE, subject: subject_name[:from]).
        update_all(subject: subject_name[:to])
    end
  end

  def down
    CSF_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSF_COURSE, subject: subject_name[:to]).
        update_all(subject: subject_name[:from])
    end
  end
end
