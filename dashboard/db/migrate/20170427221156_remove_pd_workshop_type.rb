class RemovePdWorkshopType < ActiveRecord::Migration[5.0]
  def up
    remove_column :pd_workshops, :workshop_type
  end

  def down
    # add nullable column
    add_column :pd_workshops, :workshop_type, :string, null: true

    # populate with derived data
    Pd::Workshop.where("workshop_type IS NULL").each do |workshop|
      workshop.workshop_type =
        if workshop.funded
          workshop.on_map ? "Public" : "Private"
        else
          "District"
        end
      workshop.save
    end

    # now that all columns are populated, make non-nullable again
    change_column_null :pd_workshops, :workshop_type, false
  end
end
