class CreateTeachingProfileData < ActiveRecord::Migration[6.1]
  def change
    create_table :teaching_profile_data do |t|
      t.references :user, null: false, foreign_key: true, type: :integer
      t.json :individual_data

      t.timestamps
    end
  end
end
