class AddTimestampsToRegionalPartner < ActiveRecord::Migration[5.0]
  def up
    add_and_backfill_timestamps_for(RegionalPartner)
  end

  def down
    remove_timestamps_for(RegionalPartner)
  end

  private

  def add_and_backfill_timestamps_for(model)
    add_timestamps model.table_name, null: true
    model.update_all(created_at: now, updated_at: now)
    change_column_null model.table_name, :created_at, false
    change_column_null model.table_name, :updated_at, false
  end

  def remove_timestamps_for(model)
    remove_column model.table_name, :created_at
    remove_column model.table_name, :updated_at
  end

  def now
    @_now ||= Time.zone.now
  end
end
