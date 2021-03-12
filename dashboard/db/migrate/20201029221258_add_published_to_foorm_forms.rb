class AddPublishedToFoormForms < ActiveRecord::Migration[5.0]
  def change
    add_column :foorm_forms, :published, :boolean, default: true, null: false
  end
end
