class CreateOtherTempTable < ActiveRecord::Migration[6.1]
  def change
    create_table :other_temp_tables do |t|
      t.string :name
      t.timestamps
    end
  end
end
