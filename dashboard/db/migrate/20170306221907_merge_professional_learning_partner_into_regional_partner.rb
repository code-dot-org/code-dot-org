# empty model included here for future compatibility, since the actual
# model has since been removed
class ProfessionalLearningPartner < ActiveRecord::Base
end

class MergeProfessionalLearningPartnerIntoRegionalPartner < ActiveRecord::Migration[5.0]
  def up
    ActiveRecord::Base.record_timestamps = false
    begin
      ProfessionalLearningPartner.all.each do |plp|
        regional_partner = RegionalPartner.find_or_create_by!(name: plp.name)
        regional_partner.contact_id = plp.contact_id
        regional_partner.urban = plp.urban
        regional_partner.save!
      end
    ensure
      ActiveRecord::Base.record_timestamps = true
    end
  end

  def down
    RegionalPartner.where("contact_id IS NOT NULL AND urban IS NOT NULL").each do |regional_partner|
      ProfessionalLearningPartner.where(
        name: regional_partner.name,
        contact_id: regional_partner.contact_id,
        urban: regional_partner.urban
      ).first_or_create
    end
  end
end
