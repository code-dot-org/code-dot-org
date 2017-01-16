class CreateTeacherProfile < ActiveRecord::Migration[5.0]
  def change
    create_table :teacher_profiles do |t|
      t.timestamps
      # The user to which this teacher profile belongs.
      t.belongs_to :user, null: false
      # The course (e.g., CSF, CSD, CSP, ECS) to which the information applies.
      t.string :course, null: false
      # Is the user a facilitator? A null value indicates other Code Studio
      # data should determine our belief.
      t.boolean :facilitator, default: nil
      # Is the user known to be teaching or not teaching? A null value
      # indicates other Code Studio data should determine our belief.
      t.boolean :teaching, default: nil
      # The year the teacher was PDed.
      t.string :pd_year, default: nil
      # The specific Code.org PD the teacher attended, e.g., "tc1-atl",
      # "tc2-slc", or "tc3-chi".
      t.string :pd, default: nil
      # The specific non-Code.org PD the teacher attended, e.g., "nmsi".
      t.string :other_pd, default: nil
      # Other serialized properties, including "teals".
      t.text :properties
    end
  end
end
