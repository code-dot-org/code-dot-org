partner_sites = CDO.partners.map {|x| x + '.code.org'}

get '/:short_code' do |short_code|
  short_code = 'mchoc' if short_code == 'MC'
  only_for ['code.org', 'csedweek.org', 'hourofcode.com', partner_sites].flatten
  pass if request.site == 'hourofcode.com' && ['ap', 'ca', 'co', 'gr'].include?(short_code)
  tutorial = begin
    Tutorials.new(:tutorials).find_with_short_code(short_code)
  rescue Sequel::DatabaseError
    nil
  end
  pass unless tutorial
  launch_tutorial(tutorial)
end

get '/v2/hoc/tutorial-metrics.json' do
  only_for 'code.org'
  forbidden! unless dashboard_user_helper&.admin?
  content_type :json
  JSON.pretty_generate(fetch_hoc_metrics['tutorials'])
end

# Link from Hour of Code 2014 employee engagement pages
get '/api/hour/begin_company/:company' do |company|
  redirect "/learn?company=#{company}"
end

get '/api/hour/begin/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless tutorial = Tutorials.new(:tutorials).find_with_code(code)

  # set company to nil if not a valid company
  company = request.GET['company'] || request.cookies['company']
  # Pass through the company param to the congrats page only if an entry exists in the forms.
  unless company.nil?
    company = nil unless DB[:forms].where(kind: 'CompanyProfile', name: company).first
  end

  launch_tutorial(tutorial, company: company)
end

# Specially track links from our /learn page
# TODO: (elijah) this route is currently unused, we are instead linking
# directly to tutorials and relying entirely on GA for tracking. Either
# reenable this in a scalable way or remove it entirely.
get '/api/hour/begin_learn/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless tutorial = Tutorials.new(:tutorials).find_with_code(code)
  redirect tutorial[:url], 302
end

get '/api/hour/begin_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless tutorial = Tutorials.new(:tutorials).find_with_code(code)
  launch_tutorial_pixel(tutorial)
end

get '/api/hour/certificate/:filename' do |filename|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten

  extname = File.extname(filename)
  pass unless settings.image_extnames.include?(extname)

  basename = File.basename(filename, extname)
  session, width = basename.split('-')
  pass unless row = DB[:hoc_activity].where(session: session).first

  width = width.to_i
  width = 0 unless width > 0 && width < 1754

  begin
    image = CertificateImage.create_course_certificate_image(row[:name].to_s.strip, row[:tutorial], default_random_donor: true)
    image.resize_to_fit!(width) unless width == 0
    image.format = extname[1..-1]

    dont_cache
    content_type image.format.to_sym
    image.to_blob
  ensure
    image&.destroy!
  end
end

get '/v2/hoc/certificate/:filename' do |filename|
  only_for ['code.org']
  extname = File.extname(filename)
  encoded = File.basename(filename, extname)
  begin
    data = JSON.parse(Base64.urlsafe_decode64(encoded))
  rescue ArgumentError, OpenSSL::Cipher::CipherError, JSON::ParserError
    bad_request
  end

  extnames = ['.jpg', '.jpeg', '.png']
  pass unless extnames.include?(extname)

  format = extname[1..-1]
  begin
    image = CertificateImage.create_course_certificate_image(data['name'], data['course'], data['sponsor'], data['course_title'], default_random_donor: true)
    image.format = format

    content_type format.to_sym
    expires 0, :private, :must_revalidate
    image.to_blob
  ensure
    image&.destroy!
  end
end

get '/api/hour/certificate64/:course/:filename' do |course, filename|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  extname = File.extname(filename)
  encoded = File.basename(filename, extname)
  begin
    label = Base64.urlsafe_decode64(encoded)
  rescue ArgumentError, OpenSSL::Cipher::CipherError
    bad_request
  end

  extnames = ['.jpg', '.jpeg', '.png']
  pass unless extnames.include?(extname)

  format = extname[1..-1]
  begin
    image = CertificateImage.create_course_certificate_image(label, course, default_random_donor: true)
    image.format = format

    content_type format.to_sym
    expires 0, :private, :must_revalidate
    image.to_blob
  ensure
    image&.destroy!
  end
end

get '/api/hour/finish' do
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  complete_tutorial
end

get '/api/hour/finish/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless tutorial = Tutorials.new(:tutorials).find_with_code(code)
  complete_tutorial(tutorial)
end

get '/api/hour/finish_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless tutorial = Tutorials.new(:tutorials).find_with_code(code)
  complete_tutorial_pixel(tutorial)
end

get '/api/hour/status' do
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless row = DB[:hoc_activity].where(session: request.cookies['hour_of_code']).first
  dont_cache
  content_type :json
  JSON.pretty_generate session_status_for_row(row)
end

get '/api/hour/status/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  pass unless row = DB[:hoc_activity].where(session: code).first
  dont_cache
  content_type :json
  JSON.pretty_generate session_status_for_row(row)
end

post '/api/hour/certificate' do
  only_for ['code.org', 'csedweek.org', partner_sites].flatten

  row = DB[:hoc_activity].where(session: params[:session_s]).first
  if row && !row[:name]
    name = params[:name_s].to_s.strip
    DB[:hoc_activity].where(id: row[:id]).update(name: name)
    row[:name] = name
  end

  content_type :json
  session_status_for_row(row).to_json
end

post '/v2/certificate' do
  call(env.merge('PATH_INFO' => '/api/hour/certificate'))
end
