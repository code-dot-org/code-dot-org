require 'sinatra/base'
require 'erb'
require 'sass/plugin/rack'
require 'cdo/pegasus/graphics'
require 'dynamic_config/dcdo'

class SharedResources < Sinatra::Base
  use Sass::Plugin::Rack

  # Use dynamic config for max_age settings, with the provided default as fallback.
  def self.set_max_age(type, default)
    default = 60 if rack_env? :staging
    default = 0 if rack_env? :development
    set "#{type}_max_age", proc {DCDO.get("pegasus_#{type}_max_age", default)}
  end

  ONE_HOUR = 3600

  configure do
    Sass::Plugin.options[:cache_location] = pegasus_dir('cache', '.sass-cache')
    Sass::Plugin.options[:css_location] = pegasus_dir('cache', 'css')
    Sass::Plugin.options[:template_location] = shared_dir('css')

    set :image_extnames, ['.png', '.jpeg', '.jpg', '.gif']
    set :javascript_extnames, ['.js']
    set_max_age :image, ONE_HOUR * 10
    set_max_age :image_proxy, ONE_HOUR * 5
    set_max_age :static, ONE_HOUR * 10
    set_max_age :static_proxy, ONE_HOUR * 5
  end

  before do
  end

  after do
  end

  helpers do
    def cache_for(seconds, proxy_seconds=nil)
      proxy_seconds ||= seconds / 2
      cache_control(:public, :must_revalidate, max_age: seconds, s_maxage: proxy_seconds)
    end

    # Sets caching headers based on the document type,
    # based on the :x_max_age and :x_proxy_max_age Sinatra settings.
    def cache(type)
      max_age = settings.method("#{type}_max_age").call
      proxy_max_age = settings.method("#{type}_proxy_max_age").call
      cache_for(max_age, proxy_max_age)
    end
  end

  # CSS
  get "/shared/css/*" do |uri|
    path = shared_dir('css', uri)
    unless File.file?(path)
      path = pegasus_dir('cache', 'css', uri)
      pass unless File.file?(path)
    end

    content_type :css
    cache :static
    send_file(path)
  end

  # JavaScripts
  get "/shared/js/*" do |_path|
    path = deploy_dir(request.path_info)

    extname = File.extname(path).downcase
    pass unless settings.javascript_extnames.include?(extname)

    if File.file?(path)
      content_type extname[1..-1].to_sym
      cache :static
      send_file(path)
    end

    erb_path = "#{path}.erb"
    if File.file?(erb_path)
      content_type extname[1..-1].to_sym
      cache :static
      return ERB.new(IO.read(erb_path)).result
    end

    pass
  end

  # WebAssembly
  get '/shared/wasm/*.wasm' do |_path|
    path = deploy_dir(request.path_info)
    content_type 'application/wasm'
    cache :static
    send_file path
  end

  # Images
  get '/shared/images/*' do |_path|
    path = request.path_info
    image_data = process_image(path, settings.image_extnames)
    pass if image_data.nil?
    last_modified image_data[:last_modified]
    content_type image_data[:content_type]
    cache :image
    send_file(image_data[:file]) if image_data[:file]
    image_data[:content]
  end

  def resolve_image(uri)
    settings.image_extnames.each do |extname|
      path = deploy_dir("#{uri}#{extname}")
      return path if File.file?(path)
    end
    nil
  end
end
