# parent_id/:parent read as a generic hierarchy relationship (and, in a K-12
# product, as if they meant an actual parent/child - see the Project model's
# own remix_parent_id for the same disambiguation on a different kind of
# lineage). fork_parent_id says what the reference actually is: the question
# this row was forked from.
class RenameParentIdToForkParentIdOnQuizQuestions < ActiveRecord::Migration[7.0]
  def change
    # MySQL's adapter renames the associated index automatically as part of
    # rename_column - a separate rename_index call here fails, since by the
    # time it runs the old index name no longer exists.
    rename_column :quiz_questions, :parent_id, :fork_parent_id
  end
end
