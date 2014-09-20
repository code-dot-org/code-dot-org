get '/sendy/*' do |uri|
  extname = File.extname(uri)
  pass unless ['.html','.txt'].include?(extname)

  pass unless path = resolve_document("/sendy/#{uri[0..-(extname.length+1)]}")
  src = document(path)

  layout = @locals[:header]['layout']||'default'
  unless ['', 'none'].include?(layout)
    template = resolve_template('layouts', settings.template_extnames, layout)
    raise Exception, "'#{layout}' layout not found." unless template
    src = render_template(template, @locals.merge({body:src}))
  end

  res = Net::HTTP.post_form(URI('http://premailer.dialect.ca/api/0.1/documents'), 'html'=>src, 'base_url'=>"http://#{request.site}")
  body = Net::HTTP.get(URI(JSON.parse(res.body)['documents'][extname[1..-1]]))
  [200, {'content-type'=>'text/plain'}, [body]]
end