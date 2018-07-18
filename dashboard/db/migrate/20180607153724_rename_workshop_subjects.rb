class RenameWorkshopSubjects < ActiveRecord::Migration[5.0]
  CSD_COURSE = 'CS Discoveries'.freeze
  CSD_SUBJECTS = [
    {from: 'Units 2 and 3: Web Development and Animations', to: '1-day Academic Year, Units 1 and 2'},
    {from: 'Units 3 and 4: Building Games and User Centered Design', to: '1-day Academic Year, Unit 3'},
    {from: 'Units 4 and 5: App Prototyping and Data & Society', to: '1-day Academic Year, Units 4 and 5'},
    {from: 'Unit 6: Physical Computing', to: '1-day Academic Year, Unit 6'},
  ].freeze

  CSP_COURSE = 'CS Principles'.freeze
  CSP_SUBJECTS = [
    {from: 'Units 1 and 2: The Internet and Digital Information', to: '1-day Academic Year, Units 1 and 2'},
    {from: 'Units 2 and 3: Processing data, Algorithms, and Programming', to: '1-day Academic Year, Unit 3'},
    {from: 'Units 4 and 5: Big Data, Privacy, and Building Apps', to: '1-day Academic Year, Unit 4 + Explore Prep'},
    {from: 'Units 5 and 6: Building Apps and AP Assessment Prep', to: '1-day Academic Year, Unit 5 + Create Prep'},
  ].freeze

  def up
    CSD_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:from]).
        update_all(subject: subject_name[:to])
    end

    CSP_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:from]).
        update_all(subject: subject_name[:to])
    end
  end

  def down
    CSD_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:to]).
        update_all(subject: subject_name[:from])
    end

    CSP_SUBJECTS.each do |subject_name|
      Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:to]).
        update_all(subject: subject_name[:from])
    end
  end
end
