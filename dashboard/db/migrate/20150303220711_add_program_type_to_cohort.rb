class AddProgramTypeToCohort < ActiveRecord::Migration
  def change
    add_column :cohorts, :program_type, :string
    add_index :cohorts, :program_type
  end
end
