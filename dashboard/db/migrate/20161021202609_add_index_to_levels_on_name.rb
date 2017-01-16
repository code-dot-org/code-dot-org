class AddIndexToLevelsOnName < ActiveRecord::Migration[5.0]
  def change
    change_table(:levels) do |t|
      t.index :name
    end
  end
end
