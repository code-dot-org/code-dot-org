# Like projects.remix_parent_id: lineage on the child, no FK or index.
class RenameParentIdToForkParentIdAndRemoveFkOnQuizQuestions < ActiveRecord::Migration[7.0]
  def change
    remove_foreign_key :quiz_questions, column: :parent_id
    remove_index :quiz_questions, :parent_id
    rename_column :quiz_questions, :parent_id, :fork_parent_id
  end
end
