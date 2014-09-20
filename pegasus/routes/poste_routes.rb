get '/o/:id' do |id|
  only_for 'code.org'
  delivery = Poste::Delivery.get_by_encrypted_id(id)
  Poste::Open.create(delivery: delivery, created_ip: request.ip) unless delivery.nil?
  expires 0, :private, :must_revalidate
  send_file sites_dir('all/images/1x1.png'), type: 'image/png'
end

get '/u/:id' do |id|
  only_for 'code.org'
  delivery = Poste::Delivery.get_by_encrypted_id(id)
  Contact.unsubscribe(delivery.contact.email, ip_address:request.ip) if delivery
  halt(200, "You're unsubscribed.\n")
end
