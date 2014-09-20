require 'phantomjs'

module PDF

  def self.generate_from_url(url, outpath, options={})
    cmd = [
        Phantomjs.path,
        "'" + File.expand_path('../pdf_rasterize.js',__FILE__) + "'",
        url,
        outpath,
        '"Letter"',
        1,
        '"0.5in"'
    ].join(" ")
    puts cmd if options[:verbose]
    @result = `#{cmd}`
    puts "  #{@result}" if options[:verbose]
  end

end
