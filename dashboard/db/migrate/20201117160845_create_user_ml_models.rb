class CreateUserMlModels < ActiveRecord::Migration[5.1]
  def change
    create_table :user_ml_models do |t|
      t.integer :user_id
      t.string :model_id
      t.string :name

      t.timestamps
    end
  end
end
