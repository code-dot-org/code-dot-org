class CreatePdRegionalPartnerProgramRegistration < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_regional_partner_program_registrations do |t|
      t.references :user, null: false, index: false
      t.text :form_data
      t.integer :teachercon, null: false

      t.timestamps null: false
    end

    # index on user_id and new teachercon column. Give it a custom name, as the
    # default-generated one is longer than 64 characters
    add_index :pd_regional_partner_program_registrations,
      [:user_id, :teachercon],
      unique: false,
      name: :index_pd_reg_part_prog_reg_on_user_id_and_teachercon
  end
end
