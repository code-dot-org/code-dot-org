class RemovePdFacilitatorProgramRegistrationUserIdIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :pd_facilitator_program_registrations, name: :index_pd_facilitator_program_registrations_on_user_id
  end
end
