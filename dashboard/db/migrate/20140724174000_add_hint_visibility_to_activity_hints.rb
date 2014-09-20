class AddHintVisibilityToActivityHints < ActiveRecord::Migration
  def change
    add_column :activity_hints, :hint_visibility, :integer
  end
end
