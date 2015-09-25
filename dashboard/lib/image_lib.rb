require 'mini_magick'
require 'mini_magick/image'

module ImageLib

  # Overlay a foreground and background image as described by opts, where
  # the background image is resized to 154x154 pixels and centered.
  #
  # @param [Hash] parameters
  #   opts[:background_blob] - A binary string for the background image.
  #   opts[:background_url]  - A local file path for the background image.
  #   opts[:foreground_blob] - A binary string for the foreground image.
  #   opts[:foreground_url]  - A local file path for the foreground image.
  #
  # @return [String] The new image as a blob.
  #
  # @return MiniMagick::Image
  # @throws MiniMagic::Error if a minimagic error occurs.
  # @throws ArgumentError if neither the _blob or _url parameter is provided
  #         for the foreground and background.
  def self.overlay_image(opts)
    background = read_or_open_image(opts[:background_blob], opts[:background_url])
    foreground = read_or_open_image(opts[:foreground_blob], opts[:foreground_url])

    background.geometry('154x154+0+0')

    background.composite(foreground) {|c|
      c.gravity('Center')
      c.compose('Over')
    }.to_blob
  end

  private

  def self.read_or_open_image(blob, path)
    puts "read_or_open_image(#{(blob || "").length}, #{path})"
    if blob.present?
      raise 'Invalid blob type' unless blob.is_a?(String)
      puts "encoding=#{blob.encoding}"
      MiniMagick::Image.read(blob)
    elsif path.present?
      MiniMagick::Image.open(path)
    else
      raise ArgumentError, 'Either blob or url is required for the foreground and background.'
    end
  end

  def self.test_overlay_image
    fg_blob = test_image('foreground_overlay.png').to_blob
    bg_url = test_image_path('blank_sharing_drawing_anna.png')
    framed_image = ImageLib::overlay_image(
        background_url: bg_url, foreground_blob: fg_blob)

    expected_image_name = 'expected_overlaid_image.png'
    expected_image_path = test_image_path(expected_image_name)
    expected_image = test_image(expected_image_name)

    date = Time.now.strftime("%Y-%m-%d-%H%M%S")
    generated_image_path = "/tmp/generated_image_#{date}.png"

    File.open(generated_image_path, 'w') do |file|
      file.write(framed_image)
    end

    diff = MiniMagick::Tool::Compare.new do |compare|
      compare.metric('ae')
      compare << expected_image_path
      compare << generated_image_path
      puts compare.inspect
    end

    puts "Actual image: #{generated_image_path}"
    puts "Expected image: #{expected_image_path}."

    raise "Overlaid image did not match expected value" unless diff == 0
  end

  def self.test_image_path(name)
    "/Users/pbogle/code-dot-org/dashboard/test/fixtures/#{name}"
  end

  def self.test_image(name)
    MiniMagick::Image.open(test_image_path(name))
  end


end
