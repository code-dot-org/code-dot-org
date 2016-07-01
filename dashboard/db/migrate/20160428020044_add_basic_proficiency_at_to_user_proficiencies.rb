class AddBasicProficiencyAtToUserProficiencies < ActiveRecord::Migration
  def change
    add_column :user_proficiencies, :basic_proficiency_at, :timestamp
  end
end
