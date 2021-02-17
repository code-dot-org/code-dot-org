class CreateProgrammingEnvironments < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_environments do |t|
      t.string :name, null: false
      t.text :properties

      t.timestamps
    end
  end
end
