Sequel.migration do
  up do
    DB[:forms].where(kind:'ProfessionalDevelopmentWorkshopSignup').each do |i|
      data = JSON.parse(i[:data])
      DB[:forms].where(id:i[:id]).update(parent_id:data['workshop_id_i'])
    end
  end

  down do
  end
end
