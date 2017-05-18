class AddProgramRegistrationIdToPdTeacherApplication < ActiveRecord::Migration[5.0]
  # Empty Pd::TeacherApplication model for this migration
  class Pd::TeacherApplication < ActiveRecord::Base
  end

  def change
    add_column :pd_teacher_applications, :program_registration_id, :integer, comment:
      'Id in the Pegasus forms table for the associated registration (kind: PdProgramRegistration), populated when that form is processed.'

    reversible do |dir|
      # Update existing teacher application entries (3150 as of 2017-05-08) with their program registration ids.
      dir.up do
        PEGASUS_DB[:forms].where(kind: 'PdProgramRegistration').each do |registration|
          data = JSON.parse registration[:data]
          application_id = data['pd_teacher_application_id_i']
          next unless application_id

          Pd::TeacherApplication.find(application_id).update!(program_registration_id: registration[:id])
        end
      end
    end
  end
end
