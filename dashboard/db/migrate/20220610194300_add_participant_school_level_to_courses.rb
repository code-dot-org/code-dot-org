class AddParticipantSchoolLevelToCourses < ActiveRecord::Migration[6.0]
  def up
    add_column :scripts, :participant_school_level, :string
    add_column :unit_groups, :participant_school_level, :string, null: false, default: 'k-5'
  end

  def down
    remove_column :unit_groups, :participant_school_level
    remove_column :scripts, :participant_school_level
  end
end
