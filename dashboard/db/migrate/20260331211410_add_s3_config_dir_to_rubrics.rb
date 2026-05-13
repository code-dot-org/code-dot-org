class AddS3ConfigDirToRubrics < ActiveRecord::Migration[7.0]
  def change
    add_column :rubrics, :s3_config_dir, :string
  end
end
