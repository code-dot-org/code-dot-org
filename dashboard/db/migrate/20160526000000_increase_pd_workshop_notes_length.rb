class IncreasePdWorkshopNotesLength < ActiveRecord::Migration
  def up
    change_column :pd_workshops, :notes, :string, limit: 4096
  end

  def down
    change_column :pd_workshops, :notes, :string, limit: 255
  end
end
