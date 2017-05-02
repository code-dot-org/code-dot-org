class AddFirstActivityTimeToSection < ActiveRecord::Migration[5.0]
  def change
    # Give existing rows a fake first_activity_at that's in the past, but
    # newly created rows should default to nil
    add_column :sections, :first_activity_at, :datetime
  end
end
