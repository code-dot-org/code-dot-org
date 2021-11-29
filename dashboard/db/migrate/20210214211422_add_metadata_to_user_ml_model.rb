class AddMetadataToUserMlModel < ActiveRecord::Migration[5.2]
  def change
    add_column :user_ml_models, :metadata, :text
  end
end
