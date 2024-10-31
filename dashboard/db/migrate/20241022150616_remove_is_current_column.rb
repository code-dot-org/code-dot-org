class RemoveIsCurrentColumn < ActiveRecord::Migration[6.1]
  def change
    remove_index :schools,
      name: 'index_schools_on_is_current',
      column: :is_current
    remove_column :schools, :is_current, :boolean, if_exists: true
  end
end
