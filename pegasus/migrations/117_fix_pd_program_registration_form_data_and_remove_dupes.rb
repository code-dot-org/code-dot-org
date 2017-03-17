Sequel.migration do
  up do
    registrations_by_application_id = {}

    DB[:forms].where(kind: 'PdProgramRegistration').each do |form|
      data = JSON.parse form[:data]
      application_id = data['pd_teacher_application_id_i']

      if registrations_by_application_id.key? application_id
        # Remove the duplicate form.
        DB[:forms].where(id: form[:id]).delete
      else
        registrations_by_application_id[application_id] = data

        # Update missing fields:
        application = DASHBOARD_DB[:pd_teacher_applications].where(id: application_id).first
        email = application[:primary_email]
        name = "#{data['first_name_s']} #{data['last_name_s']}"
        DB[:forms].where(id: form[:id]).update(email: email, name: name, source_id: application_id)
      end
    end
  end
end
