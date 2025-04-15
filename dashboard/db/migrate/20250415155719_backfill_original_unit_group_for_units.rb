class BackfillOriginalUnitGroupForUnits < ActiveRecord::Migration[6.1]
  def up
    Unit.all.each do |u|
      u.update_columns(original_unit_group_id: u.unit_group.id) if u.unit_group
    end
  end

  def down
    Unit.update_all(original_unit_group_id: nil)
  end
end
