class AddContactRegionalPartnerToWorkshops < ActiveRecord::Migration[5.0]
  def up
    # at time of creation, there are ~1500 PdWorkshops in the production
    # db, meaning that even this one-at-time migration should be just fine.
    Pd::Workshop.where("regional_partner_id IS NULL").each do |workshop|
      partner = RegionalPartner.find_by_contact_id(workshop.organizer.id)
      next unless partner

      workshop.regional_partner = partner
      workshop.save
    end
  end

  def down
    # intentional noop
  end
end
