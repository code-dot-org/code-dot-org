class RenameMegausersStudioPerson < ActiveRecord::Migration[5.0]
  def change
    rename_table(:megausers, :studio_people)
    rename_column(:users, :megauser_id, :studio_person_id)
  end
end
