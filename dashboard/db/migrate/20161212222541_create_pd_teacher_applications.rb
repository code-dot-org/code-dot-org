class CreatePdTeacherApplications < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_teacher_applications do |t|
      t.timestamps

      # Setting index false initially to create a unique index below. The unique param here is ignored.
      t.belongs_to :user, null: false, index: false
      t.index :user_id, unique: true

      t.string :personal_email, null: false, index: true
      t.string :school_email, null: false, index: true
      t.text :application, null: false
    end
  end
end
