class ReplacePlaceholderCspWorkshopSubjects < ActiveRecord::Migration[5.0]
  SUBJECT_NAMES = [
    {from: 'Summer Workshop', to: '5-day Summer'},
    {from: 'Workshop 1', to: 'Units 1 and 2: The Internet and Digital Information'},
    {from: 'Workshop 2', to: 'Units 2 and 3: Processing data, Algorithms, and Programming'},
    {from: 'Workshop 3', to: 'Units 4 and 5: Big Data, Privacy, and Building Apps'},
    {from: 'Workshop 4', to: 'Units 5 and 6: Building Apps and AP Assessment Prep'},
  ].freeze

  def up
    SUBJECT_NAMES.each do |subject_name|
      Pd::Workshop.where(course: 'CS Principles', subject: subject_name[:from]).
        update_all(subject: subject_name[:to])
    end
  end

  def down
    SUBJECT_NAMES.each do |subject_name|
      Pd::Workshop.where(course: 'CS Principles', subject: subject_name[:to]).
        update_all(subject: subject_name[:from])
    end
  end
end
