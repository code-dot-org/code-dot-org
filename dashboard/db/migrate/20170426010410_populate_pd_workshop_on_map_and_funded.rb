class PopulatePdWorkshopOnMapAndFunded < ActiveRecord::Migration[5.0]
  def up
    # at time of creation, there are ~1800 PdWorkshops in the production
    # db, meaning that even this one-at-time migration should be just fine.
    Pd::Workshop.where("on_map IS NULL").each do |workshop|
      workshop.try(:set_on_map_and_funded_from_workshop_type)
      workshop.save
    end
  end

  def down
    # intentional noop
  end
end
