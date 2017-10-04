class AddDetailsToRegionalPartner < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners, :attention, :string
    add_column :regional_partners, :street, :string
    add_column :regional_partners, :apartment_or_suite, :string
    add_column :regional_partners, :city, :string
    add_column :regional_partners, :state, :string
    add_column :regional_partners, :zip_code, :string
    add_column :regional_partners, :phone_number, :string
    add_column :regional_partners, :notes, :text

    reversible do |direction|
      direction.up do
        add_and_backfill_timestamps_for(RegionalPartner)
      end
      direction.down do
        remove_timestamps_for(RegionalPartner)
      end
    end
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
