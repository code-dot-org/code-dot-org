class CreateCensusStateCourseCodes < ActiveRecord::Migration[5.0]
  def change
    create_table :census_state_course_codes do |t|
      t.string :state
      t.string :course

      t.timestamps
    end
    add_index :census_state_course_codes, [:state, :course], unique: true
  end
end
