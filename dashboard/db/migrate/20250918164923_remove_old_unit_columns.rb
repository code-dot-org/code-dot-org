class RemoveOldUnitColumns < ActiveRecord::Migration[6.1]
  def up
    remove_index :scripts, name: "index_scripts_on_family_name"
    remove_index :scripts, name: "index_scripts_on_published_state"
    remove_index :scripts, name: "index_scripts_on_instruction_type"
    remove_index :scripts, name: "index_scripts_on_instructor_audience"
    remove_index :scripts, name: "index_scripts_on_participant_audience"

    remove_column :scripts, :family_name
    remove_column :scripts, :published_state
    remove_column :scripts, :instruction_type
    remove_column :scripts, :instructor_audience
    remove_column :scripts, :participant_audience

    Unit.find_each do |unit|
      unit.update_columns(properties: unit.properties.merge(version_year: nil))
    end
  end

  def down
    add_column :scripts, :family_name, :string
    add_column :scripts, :published_state, :string
    add_column :scripts, :instruction_type, :string
    add_column :scripts, :instructor_audience, :string
    add_column :scripts, :participant_audience, :string

    add_index :scripts, [:family_name], name: "index_scripts_on_family_name"
    add_index :scripts, [:published_state], name: "index_scripts_on_published_state"
    add_index :scripts, [:instruction_type], name: "index_scripts_on_instruction_type"
    add_index :scripts, [:instructor_audience], name: "index_scripts_on_instructor_audience"
    add_index :scripts, [:participant_audience], name: "index_scripts_on_participant_audience"
  end
end
