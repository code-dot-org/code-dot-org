class RenameCsdWorkshopSubjects < ActiveRecord::Migration[5.0]
  COURSE = 'CS Discoveries'.freeze
  SUBJECT_NAMES = [
    {from: 'Units 1 and 2: Problem Solving and Web Development', to: 'Units 2 and 3: Web Development and Animations'},
    {from: 'Unit 3: Animations and Games', to: 'Units 3 and 4: Building Games and User Centered Design'},
    {from: 'Units 4 and 5: The Design Process and Data and Society', to: 'Units 4 and 5: App Prototyping and Data & Society'},
  ].freeze

  def up
    SUBJECT_NAMES.each do |subject_name|
      Pd::Workshop.where(course: COURSE, subject: subject_name[:from]).
        update_all(subject: subject_name[:to])
    end
  end

  def down
    SUBJECT_NAMES.each do |subject_name|
      Pd::Workshop.where(course: COURSE, subject: subject_name[:to]).
        update_all(subject: subject_name[:from])
    end
  end
end
