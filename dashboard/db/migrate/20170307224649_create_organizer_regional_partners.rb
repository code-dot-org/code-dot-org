class CreateOrganizerRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    create_table :regional_partner_organizers do |t|
      t.integer :organizer_id, index: true, null: false
      t.integer :regional_partner_id, index: true, null: false
    end
  end
end
