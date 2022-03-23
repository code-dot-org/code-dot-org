class CreateProgrammingEnvironmentCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_environment_categories do |t|
      t.integer :programming_environment_id, null: false
      t.string :key, null: false
      t.string :name
      t.string :color

      t.index [:key, :programming_environment_id], unique: true, name: 'index_programming_environment_categories_on_key_and_env_id'
      t.index :programming_environment_id, name: 'index_programming_environment_categories_on_environment_id'

      t.timestamps
    end
  end
end
