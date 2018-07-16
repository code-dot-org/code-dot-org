class CreateCensusOtherCurriculumOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :other_curriculum_offerings do |t|
      t.string :curriculum_provider_name, null: false
      t.string :school_id, limit: 12, null: false
      t.string :course, null: false
      # limit on integers is number of bytes, not digits or display length
      t.integer :school_year, limit: 2, null: false

      t.timestamps
    end

    add_foreign_key :other_curriculum_offerings, :schools
    add_index :other_curriculum_offerings,
      [:curriculum_provider_name, :school_id, :course, :school_year],
      unique: true,
      name: 'index_other_curriculum_offerings_unique'
  end
end
