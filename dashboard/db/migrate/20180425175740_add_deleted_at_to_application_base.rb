class AddDeletedAtToApplicationBase < ActiveRecord::Migration[5.0]
  def change
    add_column :deleted_at, :datetime, null: true
  end
end
