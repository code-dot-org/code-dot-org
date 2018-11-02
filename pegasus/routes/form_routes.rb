get '/forms/uploads/*' do |uri|
  cache_file = cache_dir('fetch', request.site, request.path_info)
  unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
    FileUtils.mkdir_p File.dirname(cache_file)
    IO.write(cache_file, AWS::S3.download_from_bucket('cdo-form-uploads', uri))
  end
  pass unless File.file?(cache_file)

  cache_control :public, :must_revalidate, max_age: settings.static_max_age
  send_file(cache_file)
end

post '/forms/:kind' do |kind|
  halt 403 if settings.read_only
  begin
    content_type :json
    cache_control :private, :must_revalidate, max_age: 0
    form = insert_or_upsert_form(kind, params)
    data = JSON.load(form[:data]).merge(secret: form[:secret])
    if form[:kind] == "VolunteerContact2015"
      data.delete "volunteer_secret_s"
      data.delete "volunteer_email_s"
      data.delete "volunteer_id_i"
    end
    data.to_json
  rescue FormError => e
    halt 400, {'Content-Type' => 'text/json'}, e.errors.to_json
  rescue Sequel::UniqueConstraintViolation
    halt 409
  rescue NameError
    halt 400
  end
end

post '/forms/:kind/query' do |kind|
  kind = begin
    Object.const_get(kind)
  rescue NameError
    halt 400
  end
  pass unless kind.respond_to?(:query)
  content_type :json
  kind.query(params)
end

post "/forms/:kind/:secret" do |kind, secret|
  halt 403 if settings.read_only
  begin
    content_type :json
    cache_control :private, :must_revalidate, max_age: 0
    forbidden! unless form = update_form(kind, secret, params)
    form[:data]
  rescue FormError => e
    halt 400, {'Content-Type' => 'text/json'}, e.errors.to_json
  end
end

post '/forms/:parent_kind/:parent_id/children/:kind' do |parent_kind, parent_id, kind|
  dont_cache
  forbidden! if settings.read_only
  parent_form = DB[:forms].where('kind = ? AND (id = ? OR secret = ?)', parent_kind, parent_id, parent_id).first
  forbidden! unless parent_form

  begin
    content_type :json
    insert_or_upsert_form(kind, params, parent_id: parent_form[:id])[:data].to_json
  rescue FormError => e
    form_error! e
  end
end
