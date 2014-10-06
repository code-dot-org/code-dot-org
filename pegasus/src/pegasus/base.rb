require_relative './request'
require_relative './http_document'
require_relative './http_proxy'

module Pegasus

  class Base < Sinatra::Base

    configure do
      settings.set :environment, :development if rack_env?(:staging)
      settings.set :read_only, CDO.read_only

      settings.set :document_max_age, rack_env?(:staging) ? 0 : 3600
      settings.set :image_max_age, rack_env?(:staging) ? 0 : 36000

      settings.set :image_extnames, ['.png','.jpeg','.jpg','.gif']
      settings.set :template_extnames, ['.haml', '.md']

      settings.set :blacklist, {}
      settings.set :vary, {}
    end

    before do
      ensure_no_trailing_slash_in_uri
      apply_vary_header
      I18n.locale = request.locale
    end

    after do
      response.headers.keys.each { |i| response.headers.delete(i) if i =~ /^X-Pegasus-/; }

      status = response.status.to_s.to_i
      message = "#{status} returned for #{request.site}#{request.path_info}"
      if status >= 500
        $log.error message
      elsif status >= 400
        $log.warn message
      else
        $log.debug message
        $log.debug 'HTTP_USER_AGENT: ' + request.env['HTTP_USER_AGENT']
      end
    end

    def self.get_head_or_post(url,&block)
      get(url,&block)
      head(url,&block)
      post(url,&block)
    end

    def apply_vary_header()
      settings.vary.each_pair do |header,pages|
        headers['Vary'] = http_vary_add_type(headers['Vary'], header) if pages.include?(request.path_info)
      end
    end

    def ensure_no_trailing_slash_in_uri()
      uri = request.path_info.chomp('/')
      redirect uri unless uri.empty? || request.path_info == uri
    end

    def deliver(document)
      status(document.status)
      headers(document.headers)
      body([document.body])
    end

    def deliver_manipulated_image(path,format,mode,width,height=nil)
      content_type format.to_sym
      cache_control :public, :must_revalidate, :max_age=>settings.image_max_age

      img = load_manipulated_image(path, mode, width, height)
      img.format = format
      img.to_blob
    end

    def http_vary_add_type(vary,type)
      types = vary.to_s.split(',').map { |v| v.strip }
      return vary if types.include?('*') || types.include?(type)
      types.push(type).join(',')
    end

    def render(document,locals={})
      document.to_html!(locals.merge({
        settings: settings,
        request: request,
        response: response,
        params: params,
        session: session,
      }))
      deliver(document)
    end

    def resolve_document(root,uri,headers={})
      base = File.join(root,uri)

      extnames = settings.template_extnames
      indexes = ['index','_all']

      headers = {
        'Cache-Control'   => "max-age=#{settings.document_max_age}, public, must-revalidate",
        'Expires'         => http_expires_in(settings.document_max_age),
      }.merge(headers)

      extnames.each do |extname|
        if File.file?(path = "#{base}#{extname}")
          return HttpDocument.from_file(path,headers)
        end

        indexes.each do |index|
          if File.file?(path = File.join(base,"#{index}#{extname}"))
            return HttpDocument.from_file(path,headers)
          end
        end
      end

      unless uri == '/'
        parent = File.dirname(base)

        extnames.each do |extname|
          if File.file?(path = "#{parent}/_all#{extname}")
            return HttpDocument.from_file(path,headers.merge({
              'Cache-Control'=>"max-age=#{settings.document_max_age}, private, must-revalidate"
            }))
          end
        end
      end
      nil
    end

    def resolve_image(path)
      settings.image_extnames.each do |extname|
        file_path = "#{path}#{extname}"
        return file_path if File.file?(file_path)
      end
      nil
    end

    def submit_form(kind, request, params)
      halt 403 if settings.read_only
      begin
        content_type :json
        cache_control :private, :must_revalidate, :max_age=>0
        kind.submit(request, params).to_json
      rescue FormError=>e
        halt 400, {'Content-Type'=>'text/json'}, e.errors.to_json
      rescue ValidationError=>e
        halt 400, {'Content-Type'=>'text/json'}, e.errors.to_json
      end
    end

  end

end
