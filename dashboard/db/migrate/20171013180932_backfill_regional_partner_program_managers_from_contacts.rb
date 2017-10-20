class BackfillRegionalPartnerProgramManagersFromContacts < ActiveRecord::Migration[5.0]
  def up
    RegionalPartner.where.not(contact_id: nil).each do |regional_partner|
      regional_partner.program_manager = regional_partner.contact_id
    end
  end

  def down
  end
end
