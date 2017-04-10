class AddTeacherconToPdFacilitatorProgramRegistrations < ActiveRecord::Migration[5.0]
  def change
    # add new teachercon column
    add_column :pd_facilitator_program_registrations, :teachercon, :integer

    # make user_id non-nullable
    change_column_null :pd_facilitator_program_registrations, :user_id, false

    # index on user_id and new teachercon column. Give it a custom name, as the
    # default-generated one is longer than 64 characters
    add_index :pd_facilitator_program_registrations,
      [:user_id, :teachercon],
      unique: true,
      name: :index_pd_fac_prog_reg_on_user_id_and_teachercon
  end
end
