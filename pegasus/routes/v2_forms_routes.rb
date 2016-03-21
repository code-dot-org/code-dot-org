Sinatra::Verbs.custom :review

post '/v2/forms/:kind' do |kind|
  dont_cache
  pass if kind == 'HocSignup2014'
  forbidden! if settings.read_only
  unsupported_media_type! unless payload = request.json_body

  begin
    form = insert_form(kind, payload)
    redirect "/v2/forms/#{kind}/#{form[:secret]}", 201
  rescue FormError=>e
    form_error! e
  end
end

get '/v2/forms/:kind' do |kind|
  dont_cache
  results = []
  if dashboard_user
    DB[:forms].where(kind: kind, user_id: dashboard_user[:id]).each do |i|
      results << JSON.parse(i[:data]).merge(secret: i[:secret], id: i[:id])
    end
  end
  content_type :json
  JSON.pretty_generate(results)
end

get '/v2/forms/:kind/:secret' do |kind, secret|
  dont_cache
  forbidden! unless form = DB[:forms].where(kind: kind, secret: secret).first
  content_type :json
  JSON.pretty_generate(JSON.parse(form[:data]).merge(secret: secret, id: form[:id]))
end

delete '/v2/forms/:kind/:secret' do |kind, secret|
  dont_cache
  delete_form(kind, secret)
  no_content!
end
post '/v2/forms/:kind/:secret/delete' do |kind, secret|
  call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>"/v2/forms/#{kind}/#{secret}"))
end

patch '/v2/forms/:kind/:secret' do |kind, secret|
  dont_cache
  forbidden! if settings.read_only
  unsupported_media_type! unless payload = request.json_body

  begin
    content_type :json
    forbidden! unless form = update_form(kind, secret, payload)
    JSON.load(form[:data]).merge(secret: secret).to_json
  rescue FormError=>e
    form_error! e
  end
end
post '/v2/forms/:kind/:secret/update' do |kind, secret|
  call(env.merge('REQUEST_METHOD'=>'PATCH', 'PATH_INFO'=>"/v2/forms/#{kind}/#{secret}"))
end

review '/v2/forms/:kind/:secret' do |kind, secret|
  dont_cache
  case kind
  when "HocSignup2015"
    forbidden! unless dashboard_user && dashboard_user[:user_type] == 'teacher'
  else
    forbidden! unless dashboard_user && dashboard_user[:admin]
  end
  forbidden! if settings.read_only
  unsupported_media_type! unless payload = request.json_body

  review = payload[:review].to_s.downcase.strip
  review = nil if review.empty?

  forms = DB[:forms].where(kind: kind, secret: secret)
  forbidden! if forms.empty?
  forms.update(review: review, reviewed_by: dashboard_user[:id], reviewed_at: DateTime.now, reviewed_ip: request.ip,indexed_at: nil)

  content_type :json
  ({review: review}).to_json
end
post '/v2/forms/:kind/:secret/review' do |kind, secret|
  call(env.merge('REQUEST_METHOD'=>'REVIEW', 'PATH_INFO'=>"/v2/forms/#{kind}/#{secret}"))
end

get '/v2/forms/ProfessionalDevelopmentWorkshopSignup/:secret/status/cancelled' do |secret|

  def send_receipts(form)
    templates = ['workshop_signup_cancel_receipt','workshop_signup_cancel_notice']
    recipient = Poste2.create_recipient(form[:email], name: form[:name], ip_address: form[:updated_ip])
    templates.each do |template|
      Poste2.send_message(template, recipient, form_id: form[:id])
    end
    templates.count
  end

  dont_cache
  form = DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshopSignup', secret: secret).first
  forbidden! if form.empty?
  data = JSON.parse(form[:data])
  data['status_s'] = 'cancelled'
  DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshopSignup', secret: secret).update(data: data.to_json, indexed_at: nil)

  send_receipts(form)

  content_type :json
  data.to_json
end

get '/v2/forms/:parent_kind/:parent_secret/children/:kind' do |parent_kind, parent_secret, kind|
  dont_cache
  results = []

  forbidden! unless parent = DB[:forms].where(kind: parent_kind, secret: parent_secret).first

  DB[:forms].where(kind: kind).and(parent_id: parent[:id]).each do |i|
    results << JSON.parse(i[:data]).merge(secret: i[:secret])
  end

  content_type :json
  JSON.pretty_generate(results)
end

get '/v2/forms/:parent_kind/:parent_secret/children/:kind/:secret' do |_parent_kind, _parent_secret, kind, secret|
  dont_cache
  forbidden! unless form = DB[:forms].where(kind: kind, secret: secret).first
  content_type :json
  JSON.pretty_generate(JSON.parse(form[:data]).merge(secret: secret))
end

post '/v2/forms/:parent_kind/:parent_id/children/:kind' do |parent_kind, parent_id, kind|
  dont_cache
  forbidden! if settings.read_only
  unsupported_media_type! unless payload = request.json_body

  parent_form = DB[:forms].where('kind = ? AND (id = ? OR secret = ?)', parent_kind, parent_id, parent_id).first
  forbidden! unless parent_form

  begin
    form = insert_form(kind, payload, parent_id: parent_form[:id])
    redirect "/v2/forms/#{kind}/#{form[:secret]}", 201
  rescue FormError=>e
    form_error! e
  end
end
