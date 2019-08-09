class RenameAcademicYearWorkshopNames < ActiveRecord::Migration[5.0]
  CSD_COURSE = 'CS Discoveries'.freeze
  CSD_SUBJECTS = [
    {form: '1-day Academic Year, Units 1 and 2', to: 'Workshop 1: Unit 3'},
    {form: '1-day Academic Year, Unit 3', to: 'Workshop 2: Unit 4'},
    {form: '1-day Academic Year, Units 4 and 5', to: 'Workshop 3: Unit 5'},
    {form: '1-day Academic Year, Unit 6', to: 'Workshop 4: Unit 6'},
    {form: '2-day Academic Year, Units 1 to 3', to: '2-day, Workshops 1+2: Units 3 and 4'},
    {form: '2-day Academic Year, Units 4 to 6', to: '2-day, Workshops 3+4: Units 5 and 6'},
  ].freeze

  CSP_COURSE = 'CS Principles'.freeze
  CSP_SUBJECTS = [
    {from: '1-day Academic Year, Units 1 and 2', to: 'Workshop 1: Unit 3'},
    {from: '1-day Academic Year, Unit 3', to: 'Workshop 2: Unit 4 and Explore Task'},
    {from: '1-day Academic Year, Unit 4 + Explore Prep', to: 'Workshop 3: Unit 5 and Create Task'},
    {from: '1-day Academic Year, Unit 5 + Create Prep', to: 'Workshop 4: Unit 5 and Multiple Choice Exam'},
    {from: '2-day Academic Year, Units 1 to 3', to: '2-day, Workshops 1+2: Units 3-4 and Explore Task'},
    {from: '2-day Academic Year, Units 4 and 5 + AP Prep', to: '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam'},
  ].freeze

  def up
    CSD_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:from]).
        where(started_at: nil).
        update_all(subject: subject_name[:to])
    end

    CSP_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:from]).
        where(started_at: nil).
        update_all(subject: subject_name[:to])
    end
  end

  def down
    CSD_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:to]).
        where(started_at: nil).
        update_all(subject: subject_name[:from])
    end

    CSP_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:to]).
        where(started_at: nil).
        update_all(subject: subject_name[:from])
    end
  end
end
