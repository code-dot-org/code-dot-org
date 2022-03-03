class AddPublishedToProgrammingEnvironment < ActiveRecord::Migration[5.2]
  def change
    add_column :programming_environments, :published, :bool, null: false, default: false
  end
end
