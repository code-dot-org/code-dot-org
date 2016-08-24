class AddHintVisibilityToActivityHints < ActiveRecord::Migration[4.2]
  def change
    add_column :activity_hints, :hint_visibility, :integer
  end
end
