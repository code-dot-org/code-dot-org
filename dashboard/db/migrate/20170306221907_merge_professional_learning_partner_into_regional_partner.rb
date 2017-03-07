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

    drop_table :professional_learning_partners
  end

  def down
    create_table :professional_learning_partners do |t|
      t.string :name, null: false
      t.references :contact, null: false
      t.boolean :urban
      t.index [:name, :contact_id], unique: true
    end

    RegionalPartner.where("contact_id IS NOT NULL AND urban IS NOT NULL").each do |regional_partner|
      ProfessionalLearningPartner.create(
        name: regional_partner.name,
        contact_id: regional_partner.contact_id,
        urban: regional_partner.urban
      )
    end
  end
end
