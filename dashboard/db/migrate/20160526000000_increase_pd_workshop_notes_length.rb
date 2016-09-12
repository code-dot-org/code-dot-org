class IncreasePdWorkshopNotesLength < ActiveRecord::Migration[4.2]
  def up
    change_column :pd_workshops, :notes, :text
  end

  def down
    change_column :pd_workshops, :notes, :string, limit: 255
  end
end
