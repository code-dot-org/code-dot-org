get '/:short_code' do |short_code|
  only_for ['code.org', 'csedweek.org', 'hourofcode.com', 'uk.code.org']
  pass if request.site == 'hourofcode.com' && ['ap', 'ca', 'co', 'gr'].include?(short_code)
  pass unless tutorial = DB[:tutorials].where(short_code:short_code).first 
  launch_tutorial(tutorial)
end

get '/v2/hoc/tutorial-metrics.json' do
  expires 300, :public, :must_revalidate
  content_type :json
  JSON.pretty_generate(fetch_hoc_metrics['tutorials'])
end

# Employee engagement
get '/api/hour/begin_company/:company' do |company|
  pass unless form = DB[:forms].where(kind:'CompanyProfile', name:company).first
  pass unless tutorial = DB[:tutorials].where(code:'codeorg').first
  launch_tutorial(tutorial, company:company)
end

get '/api/hour/begin/:code' do |code|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless tutorial = DB[:tutorials].where(code:code).first
  launch_tutorial(tutorial)
end

get '/api/hour/begin_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless tutorial = DB[:tutorials].where(code:code).first
  launch_tutorial_pixel(tutorial)
end

get '/api/hour/certificate/:filename' do |filename|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']

  extname = File.extname(filename)
  pass unless settings.image_extnames.include?(extname)

  basename = File.basename(filename, extname)
  session, width = basename.split('-')
  pass unless row = DB[:hoc_activity].where(session:session).first

  width = width.to_i
  width = 0 unless(width > 0 && width < 1754)

  image = create_course_certificate_image(row[:name].to_s.strip, 'hoc')
  image.resize_to_fit!(width) unless width == 0
  image.format = extname[1..-1]

  dont_cache
  content_type image.format.to_sym
  image.to_blob
end

get '/v2/hoc/certificate/:filename' do |filename|
  only_for ['code.org']
  extname = File.extname(filename)
  encoded = File.basename(filename, extname)
  data = JSON.parse(Base64.urlsafe_decode64(encoded))

  extnames = ['.jpg','.jpeg','.png']
  pass unless extnames.include?(extname)

  format = extname[1..-1]
  image = create_course_certificate_image(data['name'], data['course'], data['sponsor'])
  image.format = format

  content_type format.to_sym
  expires 0, :private, :must_revalidate
  image.to_blob
end

get '/api/hour/certificate64/:course/:filename' do |course, filename|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  extname = File.extname(filename)
  encoded = File.basename(filename, extname)
  label = Base64.urlsafe_decode64(encoded)

  extnames = ['.jpg','.jpeg','.png']
  pass unless extnames.include?(extname)

  format = extname[1..-1]
  image = create_course_certificate_image(label, course)
  image.format = format

  content_type format.to_sym
  expires 0, :private, :must_revalidate
  image.to_blob
end

get '/api/hour/finish' do
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  complete_tutorial()
end

get '/api/hour/finish/:code' do |code|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless tutorial = DB[:tutorials].where(code:code).first
  complete_tutorial(tutorial)
end

get '/api/hour/finish_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless tutorial = DB[:tutorials].where(code:code).first
  complete_tutorial_pixel(tutorial)
end

get '/api/hour/status' do
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless row = DB[:hoc_activity].where(session:request.cookies['hour_of_code']).first
  dont_cache
  content_type :json
  JSON.pretty_generate session_status_for_row(row)
end

get '/api/hour/status/:code' do |code|
  only_for ['code.org', 'csedweek.org', 'uk.code.org']
  pass unless row = DB[:hoc_activity].where(session:code).first
  dont_cache
  content_type :json
  JSON.pretty_generate session_status_for_row(row)
end

post '/api/hour/certificate' do
  only_for ['code.org', 'csedweek.org', 'uk.code.org']

  row = DB[:hoc_activity].where(session:params[:session_s]).first
  if row
    begin
      form = insert_form('HocCertificate2013', params.merge(email_s:'anonymous@code.org'))
    rescue FormError=>e
      halt 400, {'Content-Type'=>'text/json'}, e.errors.to_json
    end

    DB[:hoc_activity].where(id:row[:id]).update(name:form[:name])

    row[:name] = form[:name]
  end

  content_type :json
  session_status_for_row(row).to_json
end
