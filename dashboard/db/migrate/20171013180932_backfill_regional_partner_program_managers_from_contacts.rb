class BackfillRegionalPartnerProgramManagersFromContacts < ActiveRecord::Migration[5.0]
  def up
    RegionalPartner.joins(:contact).each do |regional_partner|
      begin
        regional_partner.program_manager = regional_partner.contact.id
      rescue RuntimeError => e
        # Log the error but don't fail the migration if something goes wrong.
        CDO.logger.error "Error converting Regional Partner (#{regional_partner.id})  "\
          "Contact (#{regional_partner.contact.id}) into a Program Manager: #{e.message}"
      end
    end
  end

  def down
  end
end
