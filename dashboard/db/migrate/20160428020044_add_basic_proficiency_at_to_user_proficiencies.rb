class AddBasicProficiencyAtToUserProficiencies < ActiveRecord::Migration[4.2]
  def change
    add_column :user_proficiencies, :basic_proficiency_at, :timestamp
  end
end
