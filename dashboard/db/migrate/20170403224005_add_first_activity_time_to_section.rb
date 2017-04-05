class AddFirstActivityTimeToSection < ActiveRecord::Migration[5.0]
  def change
    # Give existing rows a fake first_activity_time that's in the past, but
    # newly created rows should default to nil
    add_column :sections, :first_activity_time, :datetime, default: DateTime.parse('1st Jan 1970')
    change_column_default :sections, :first_activity_time, from: DateTime.parse('1st Jan 1970'), to: nil
  end
end
