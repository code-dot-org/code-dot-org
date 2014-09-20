class RemoveSectionNameUniqueIndex < ActiveRecord::Migration
  def up
    remove_index :sections, [:user_id, :name]
    add_index :sections, :user_id
  end

  def down
    remove_index :sections, :user_id
    # copied from schema.rb:
    add_index "sections", ["user_id", "name"], name: "index_sections_on_user_id_and_name", unique: true, using: :btree
  end
end
