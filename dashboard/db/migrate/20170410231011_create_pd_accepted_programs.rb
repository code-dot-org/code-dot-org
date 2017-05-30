class CreatePdAcceptedPrograms < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_accepted_programs do |t|
      t.timestamps
      t.string :workshop_name, null: false
      t.string :course, null: false
      t.integer :user_id, null: false
      t.integer :teacher_application_id
    end
  end
end
