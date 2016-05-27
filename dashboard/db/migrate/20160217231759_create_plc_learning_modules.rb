class CreatePlcLearningModules < ActiveRecord::Migration
  def change
    create_table :plc_learning_modules do |t|
      t.string :name

      t.timestamps null: false
    end
  end
end
