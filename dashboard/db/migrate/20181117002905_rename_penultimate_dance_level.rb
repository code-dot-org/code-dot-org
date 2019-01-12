class RenamePenultimateDanceLevel < ActiveRecord::Migration[5.0]
  def up
    old_name = 'Dance_Party_11.5'
    new_name = 'Dance_Party_11_5'
    return if Level.find_by(name: new_name)
    level = Level.find_by(name: old_name)
    return unless level
    level.name = new_name
    level.save!
  end

  def down
  end
end
