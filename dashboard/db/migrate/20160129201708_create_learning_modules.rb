class CreateLearningModules < ActiveRecord::Migration
  def change
    create_table :learning_modules do |t|
      t.string :name
      t.string :learning_module_type

      t.timestamps null: false
    end
  end
end
