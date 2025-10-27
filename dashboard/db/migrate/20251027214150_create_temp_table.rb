class CreateTempTable < ActiveRecord::Migration[6.1]
  def change
    create_table :temp_tables do |t|
      t.string :name
      t.timestamps
    end
  end
end
