require 'sinatra/base'
require 'erb'
require 'sass/plugin/rack'
require 'cdo/pegasus/graphics'

class SharedResources < Sinatra::Base

  use Sass::Plugin::Rack

  configure do
    static_max_age = [:development, :staging].include?(rack_env) ? 0 : 3600

    Sass::Plugin.options[:cache_location] = pegasus_dir('cache', '.sass-cache')
    Sass::Plugin.options[:css_location] = pegasus_dir('cache', 'css')
    Sass::Plugin.options[:template_location] = shared_dir('css')

    set :css_max_age, static_max_age
    set :image_extnames, ['.png','.jpeg','.jpg','.gif']
    set :image_max_age, static_max_age
    set :javascript_extnames, ['.js']
    set :javascript_max_age, static_max_age
  end

  before do
  end

  after do
  end

  helpers do
  end

  # CSS
  get "/shared/css/*" do |uri|
    path = shared_dir('css', uri)
    unless File.file?(path)
      path = pegasus_dir('cache', 'css', uri)
      pass unless File.file?(path)
    end

    content_type :css
    cache_control :public, :must_revalidate, max_age: settings.css_max_age
    send_file(path)
  end

  # JavaScripts
  get "/shared/js/*" do |path|
    path = deploy_dir(request.path_info)

    extname = File.extname(path).downcase
    pass unless settings.javascript_extnames.include?(extname)

    if File.file?(path)
      content_type extname[1..-1].to_sym
      cache_control :public, :must_revalidate, max_age: settings.javascript_max_age
      send_file(path)
    end

    erb_path = "#{path}.erb"
    if File.file?(erb_path)
      content_type extname[1..-1].to_sym
      cache_control :public, :must_revalidate, max_age: settings.javascript_max_age
      return ERB.new(IO.read(erb_path)).result
    end

    pass
  end

  # Images
  get '/shared/images/*' do |path|
    path = request.path_info
    image_data = process_image(path, settings.image_extnames, settings.image_max_age)
    pass if image_data.nil?
    last_modified image_data[:last_modified]
    content_type image_data[:content_type]
    cache_control *image_data[:cache_control]
    send_file(image_data[:file]) if image_data[:file]
    image_data[:content]
  end

end
