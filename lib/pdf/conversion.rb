require_relative '../../deployment'

module PDF
  def self.generate_from_url(url, outpath, options={})
    script_path = "#{deploy_dir}/bin/generate-pdf"
    cmd = [
      'node',
      script_path,
      '-u', url,
      '-o', Shellwords.escape(outpath),
    ].join(" ")
    puts cmd if options[:verbose]
    @result = `#{cmd}`
    puts "  #{@result}" if options[:verbose]
  end
end
