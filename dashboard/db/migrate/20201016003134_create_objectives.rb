class CreateObjectives < ActiveRecord::Migration[5.0]
  def change
    create_table :objectives do |t|
      t.text :properties
      t.references :lesson

      t.timestamps
    end
  end
end
