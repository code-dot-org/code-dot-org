require 'sinatra/base'
require 'erb'
require 'sass/plugin/rack'

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
    cache_control :public, :must_revalidate, max_age:settings.css_max_age
    send_file(path)
  end

  # JavaScripts
  get "/shared/js/*" do |path|
    path = deploy_dir(request.path_info)

    extname = File.extname(path).downcase
    pass unless settings.javascript_extnames.include?(extname)

    if File.file?(path)
      content_type extname[1..-1].to_sym
      cache_control :public, :must_revalidate, max_age:settings.javascript_max_age
      send_file(path)
    end

    erb_path = "#{path}.erb"
    if File.file?(erb_path)
      content_type extname[1..-1].to_sym
      cache_control :public, :must_revalidate, max_age:settings.javascript_max_age
      return ERB.new(IO.read(erb_path)).result
    end

    pass
  end

  # Images
  get "/shared/images/*" do |path|
    path = request.path_info

    extname = File.extname(path).downcase
    pass unless settings.image_extnames.include?(extname)
    image_format = extname[1..-1]

    basename = File.basename(path, extname)
    dirname = File.dirname(path)

    # Manipulated?
    if dirname =~ /\/(fit-|fill-)?(\d+)x?(\d*)$/ || dirname =~ /\/(fit-|fill-)?(\d*)x(\d+)$/
      manipulation = File.basename(dirname)
      dirname = File.dirname(dirname)
    end

    # Assume we are returning the same resolution as we're reading.
    retina_in = retina_out = basename[-3..-1] == '@2x'

    path = resolve_image File.join(dirname, basename)
    unless path
      # Didn't find a match at this resolution, look for a match at the other resolution.
      if retina_out
        basename = basename[0...-3]
        retina_in = false
      else
        basename += '@2x'
        retina_in = true
      end
      path = resolve_image File.join(dirname, basename)
    end
    pass unless path # No match at any resolution.

    if ((retina_in == retina_out) || retina_out) && !manipulation && File.extname(path) == extname
      # No [useful] modifications to make, return the original.
      content_type image_format.to_sym
      cache_control :public, :must_revalidate, max_age:settings.image_max_age
      send_file(path)
    else
      image = Magick::Image.read(path).first

      mode = :resize

      if manipulation
        matches = manipulation.match /(?<mode>fit-|fill-)?(?<width>\d*)x?(?<height>\d*)$/m
        mode = matches[:mode][0...-1].to_sym unless matches[:mode].blank?
        width = matches[:width].to_i unless matches[:width].blank?
        height = matches[:height].to_i unless matches[:height].blank?

        if retina_out
          # Manipulated images always specify non-retina sizes in the manipulation string.
          width *= 2 if width
          height *= 2 if height
        end
      else
        width = image.columns
        height = image.rows

        # Retina sources need to be downsampled for non-retina output
        if retina_in && !retina_out
          width /= 2
          height /= 2
        end
      end
    end

    case mode
    when :fill
      # If only one dimension provided, assume a square
      width ||= height
      image = image.resize_to_fill(width, height)
    when :fit
      image = image.resize_to_fit(width, height)
    when :resize
      # If only one dimension provided, assume a square
      height ||= width
      width ||= height
      image = image.resize(width, height)
    else
      raise StandardError, 'Unreachable code reached!'
    end

    image.format = image_format

    content_type image_format.to_sym
    cache_control :public, :must_revalidate, max_age:settings.image_max_age
    image.to_blob
  end

  def resolve_image(uri)
    settings.image_extnames.each do |extname|
      path = deploy_dir("#{uri}#{extname}")
      return path if File.file?(path)
    end
    nil
  end

end
