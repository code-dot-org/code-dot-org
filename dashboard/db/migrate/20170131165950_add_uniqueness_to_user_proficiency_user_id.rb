class AddUniquenessToUserProficiencyUserId < ActiveRecord::Migration[5.0]
  def up
    # Note that we rename the existing index, otherwise the `add_index` fails
    # as the (default) index name already exists. Note that we do not remove the
    # index before adding the index (a simpler way to skirt the issue) so as to
    # assure an index always exists (for production performance).
    rename_index :user_proficiencies, 'index_user_proficiencies_on_user_id', 'index_user_proficiencies_on_user_id_non_unique'
    add_index :user_proficiencies, :user_id, unique: true
    remove_index :user_proficiencies, name: :index_user_proficiencies_on_user_id_non_unique
  end
end
