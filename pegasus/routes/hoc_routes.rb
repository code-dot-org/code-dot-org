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

# Link from Hour of Code 2014 employee engagement pages
get '/api/hour/begin_company/:company' do |company|
  redirect "/learn?company=#{company}"
end

get '/api/hour/begin/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  tutorial = Tutorials.new(:tutorials).find_with_code(code)
  tutorial ||= Tutorials.new(:tutorials_more).find_with_code(code)

  pass unless tutorial

  # set company to nil if not a valid company
  company = request.GET['company'] || request.cookies['company']
  # Pass through the company param to the congrats page only if an entry exists in the forms.
  if !company.nil? && !DB[:forms].where(kind: 'CompanyProfile', name: company).first
    company = nil
  end

  launch_tutorial(tutorial, company: company)
end

# Specially track links from our /learn page
# TODO: (elijah) this route is currently unused, we are instead linking
# directly to tutorials and relying entirely on GA for tracking. Either
# reenable this in a scalable way or remove it entirely.
get '/api/hour/begin_learn/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  tutorial = Tutorials.new(:tutorials).find_with_code(code)
  tutorial ||= Tutorials.new(:tutorials_more).find_with_code(code)

  pass unless tutorial
  redirect tutorial[:url], 302
end

get '/api/hour/begin_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  tutorial = Tutorials.new(:tutorials).find_with_code(code)
  tutorial ||= Tutorials.new(:tutorials_more).find_with_code(code)

  pass unless tutorial
  launch_tutorial_pixel(tutorial)
end

get '/api/hour/finish' do
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  complete_tutorial
end

get '/api/hour/finish/:code' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  tutorial = Tutorials.new(:tutorials).find_with_code(code)
  tutorial ||= Tutorials.new(:tutorials_more).find_with_code(code)

  pass unless tutorial
  complete_tutorial(tutorial)
end

get '/api/hour/finish_:code.png' do |code|
  only_for ['code.org', 'csedweek.org', partner_sites].flatten
  tutorial = Tutorials.new(:tutorials).find_with_code(code)
  tutorial ||= Tutorials.new(:tutorials_more).find_with_code(code)

  pass unless tutorial
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
