class AddProgramTypeToCohort < ActiveRecord::Migration[4.2]
  def change
    add_column :cohorts, :program_type, :string
    add_index :cohorts, :program_type
  end
end
