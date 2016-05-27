get '/l/:id/:url' do |id, url_64|
  only_for 'code.org'
  dont_cache

  delivery = DB[:poste_deliveries].where(id: Poste.decrypt_id(id)).first
  pass unless delivery

  url_id = Base64.urlsafe_decode64(url_64).to_i
  url = DB[:poste_urls].where(id: url_id).first
  pass unless url

  DB[:poste_clicks].insert(
    contact_id: delivery[:contact_id],
    delivery_id: delivery[:id],
    message_id: delivery[:message_id],
    url_id: url[:id],
    created_at: DateTime.now,
    created_ip: request.ip,
  )

  redirect url[:url], 302
end

get '/o/:id' do |id|
  only_for 'code.org'
  dont_cache
  delivery = DB[:poste_deliveries].where(id: Poste.decrypt_id(id)).first
  id = DB[:poste_opens].insert(delivery_id: delivery[:id], created_ip: request.ip, created_at: DateTime.now) if delivery
  response.headers['X-Poste-Open-Id'] = id.to_s
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
end

get '/u/:id' do |id|
  only_for 'code.org'
  dont_cache
  delivery = DB[:poste_deliveries].where(id: Poste.decrypt_id(id)).first
  Poste.unsubscribe(delivery[:contact_email], ip_address: request.ip) if delivery
  halt(200, "You're unsubscribed.\n")
end

get '/unsubscribe/:email' do |email|
  only_for 'code.org'
  dont_cache
  email = email.to_s.strip.downcase
  Poste.unsubscribe(email, ip_address: request.ip)
  halt(200, "#{email} unsubscribed.\n")
end

get '/emails/:name' do |name|
  pass unless template = Poste.resolve_template(name)
  @locals[:tracking_pixel] = '/images/1x1.png'
  @locals[:unsubscribe_link] = '#'
  result = document(template)
  @locals[:header]['layout'] = 'sendy'
  @locals[:header]['theme'] = 'none'
  result
end

post '/v2/poste/send-message' do
  forbidden! unless dashboard_user_helper && dashboard_user_helper.admin?

  template = params[:template].to_s
  template = File.basename(template, '.md')

  template_params = JSON.parse(params[:params]) unless params[:params].to_s.empty?
  template_params ||= {}

  recipients = params[:recipients].to_s.split(/[\n,;]/).map(&:strip)

  if params[:recipients_file]
    if params[:recipients_file][:type] == "text/csv"
      recipients_csv = CSV.parse(params[:recipients_file][:tempfile].read, {headers: true})
      if recipients_csv.headers.include?('email')
        recipients += recipients_csv.map {|recipient| recipient["email"]}
      else
        return 'Invalid CSV. Make sure it has an "email" column'
      end
    else
      return 'Invalid file. Make sure it is of type text/csv.'
    end
  end
  recipients.each do |email|
    recipient = Poste2.ensure_recipient(email, ip_address: request.ip)
    Poste2.send_message(template, recipient, template_params)
  end

  content_type :text
  "#{recipients.count} #{template} messages sent to:\n\n#{recipients.join("\n")}"
end
