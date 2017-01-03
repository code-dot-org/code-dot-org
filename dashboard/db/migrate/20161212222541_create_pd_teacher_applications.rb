class CreatePdTeacherApplications < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_teacher_applications do |t|
      t.timestamps

      # Setting index false initially to create a unique index below. The unique param doesn't work here.
      t.belongs_to :user, null: false, index: false
      t.index :user_id, unique: true

      t.string :primary_email, null: false, index: true
      t.string :secondary_email, null: false, index: true
      t.text :application, null: false
    end
  end
end
