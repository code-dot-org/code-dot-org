class AddDeletedAtToApplicationBase < ActiveRecord::Migration[5.0]
  def change
    change_table :pd_applications do |t|
      t.column :deleted_at, :datetime, null: true
    end
  end
end
