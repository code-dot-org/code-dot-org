class ConvertHasNumberedUnitsToNumberedUnits < ActiveRecord::Migration[6.1]
  def up
    UnitGroup.find_each do |unit_group|
      properties = unit_group.properties || {}

      # Check if has_numbered_units exists and is true
      if properties['has_numbered_units'] == true
        properties['numbered_units'] = 'auto'
      end

      # Remove the old key (whether it existed or not)
      properties.delete('has_numbered_units')

      # Update the unit group
      unit_group.update_column(:properties, properties)
    end
  end

  def down
    UnitGroup.find_each do |unit_group|
      properties = unit_group.properties || {}

      # Check if numbered_units exists and is 'auto' or 'custom'
      if properties['numbered_units'] == 'auto' || properties['numbered_units'] == 'custom'
        properties['has_numbered_units'] = true
      end
      # If numbered_units doesn't exist or is 'none', don't add has_numbered_units

      # Remove the new key
      properties.delete('numbered_units')

      # Update the unit group
      unit_group.update_column(:properties, properties)
    end
  end
end
