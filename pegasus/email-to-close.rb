require_relative 'src/env'
require src_dir 'database'
require src_dir 'forms'
require pegasus_dir 'helpers.rb'

DB[:forms].where(kind:'ProfessionalDevelopmentWorkshop').each do |row|
  data = JSON.load(row[:data]).merge(JSON.load(row[:processed_data]))
  next unless data['stopped_dt']
  
  snapshot = ProfessionalDevelopmentWorkshop.progress_snapshot(data['section_id_s'])
  recipients = snapshot.map{|row| {email: row[:email], name: row[:name]}}

  recipients.each do |recipient|
    Poste2.send_message('professional-development-workshop-section-receipt',
                        Poste2.ensure_recipient(recipient[:email], name: recipient[:name], ip_address: '127.0.0.1'),
                        workshop_id:row[:id],
                        location_name:data['location_name_s'],
                        facilitator_name:data['name_s'],
                        start_date:data['dates'] && data['dates'].first ? data['dates'].first['date_s'] : nil)
    #puts JSON.pretty_generate({
    #  recipient:recipient,
    #  workshop_id:row[:id],
    #  location_name:data['location_name_s'],
    #  facilitator_name:data['name_s'],
    #  start_date:data['dates'] && data['dates'].first ? data['dates'].first['date_s'] : nil,
    #})
  end
end

