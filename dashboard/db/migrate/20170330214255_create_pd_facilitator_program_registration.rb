class CreatePdFacilitatorProgramRegistration < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_facilitator_program_registrations do |t|
      t.references :user, index: true
      t.text :form_data

      t.timestamps null: false
    end
  end
end
