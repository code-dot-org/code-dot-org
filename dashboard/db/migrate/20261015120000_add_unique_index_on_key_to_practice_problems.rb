class AddUniqueIndexOnKeyToPracticeProblems < ActiveRecord::Migration[7.0]
  def change
    add_index :practice_problems, :key, unique: true
  end
end
