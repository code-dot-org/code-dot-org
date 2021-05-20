class CreateTeacherScores < ActiveRecord::Migration[5.0]
  def change
    create_table :teacher_scores do |t|
      t.integer :user_level_id
      t.integer :teacher_id
      t.integer :score
      t.datetime :created_at

      t.timestamps
    end
    add_index :teacher_scores, :user_level_id
  end
end
