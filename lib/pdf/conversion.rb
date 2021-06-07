require_relative '../../deployment'

module PDF
  def self.generate_from_url(url, outpath, options={})
    invoke_generation_script(
      [
        '-u', Shellwords.escape(url),
        '-o', Shellwords.escape(outpath),
      ],
      options
    )
  end

  def self.generate_from_html(html, outpath, options={})
    invoke_generation_script(
      [
        '-h', Shellwords.escape(html),
        '-o', Shellwords.escape(outpath),
      ],
      options
    )
  end

  def self.invoke_generation_script(args, options={})
    script_path = "#{deploy_dir}/bin/generate-pdf"
    cmd = (['node', script_path] + args).join(" ")
    puts cmd if options[:verbose]
    @result = `#{cmd}`
    puts "  #{@result}" if options[:verbose]
  end
end
