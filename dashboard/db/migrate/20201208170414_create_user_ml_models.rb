class CreateUserMlModels < ActiveRecord::Migration[5.2]
  def change
    create_table :user_ml_models do |t|
      t.integer :user_id
      t.string :model_id
      t.string :name
      t.datetime :deleted_at
      t.datetime :purged_at

      t.timestamps
    end
    add_index :user_ml_models, :user_id
    add_index :user_ml_models, :model_id
  end
end
