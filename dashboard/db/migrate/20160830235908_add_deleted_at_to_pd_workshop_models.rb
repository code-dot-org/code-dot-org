class AddDeletedAtToPdWorkshopModels < ActiveRecord::Migration[5.0]
  # Adding deleted_at to Pd::Workshop and associated models to prepare for soft-delete.
  # See http://www.rubydoc.info/gems/paranoia/2.1.5
  def change
    change_table :pd_workshops do |t|
      t.column :deleted_at, :datetime, null: true
    end

    change_table :pd_enrollments do |t|
      t.column :deleted_at, :datetime, null: true
    end

    change_table :pd_sessions do |t|
      t.column :deleted_at, :datetime, null: true
    end

    change_table :pd_attendances do |t|
      t.column :deleted_at, :datetime, null: true
    end
  end
end
