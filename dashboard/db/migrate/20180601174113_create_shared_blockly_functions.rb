class CreateSharedBlocklyFunctions < ActiveRecord::Migration[5.0]
  def change
    create_table :shared_blockly_functions do |t|
      t.string :name, null: false
      t.text :description
      t.text :arguments
      t.text :stack
    end
  end
end
