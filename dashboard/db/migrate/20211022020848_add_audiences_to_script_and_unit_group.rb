class AddAudiencesToScriptAndUnitGroup < ActiveRecord::Migration[5.2]
  def up
    add_column :scripts, :instructor_audience, :string
    add_column :scripts, :participant_audience, :string
    add_index :scripts, :instructor_audience
    add_index :scripts, :participant_audience

    add_column :unit_groups, :instructor_audience, :string, null: false, default: 'teacher'
    add_column :unit_groups, :participant_audience, :string, null: false, default: 'student'
    add_index :unit_groups, :instructor_audience
    add_index :unit_groups, :participant_audience
  end

  def down
    remove_column :unit_groups, :instructor_audience
    remove_column :unit_groups, :participant_audience

    remove_column :scripts, :instructor_audience
    remove_column :scripts, :participant_audience
  end
end
