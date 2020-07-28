class AddKeyToLesson < ActiveRecord::Migration[5.0]
  def change
    add_column :stages, :key, :string, null: false
  end
end
