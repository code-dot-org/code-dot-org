require_relative '../../deployment'

module PDF
  def self.generate_from_url(url, outpath, options = {})
    invoke_generation_script(
      [
        '-u', Shellwords.escape(url),
        '-o', Shellwords.escape(outpath),
      ],
      options
    )
  end

  def self.generate_from_html(html, outpath, options = {})
    invoke_generation_script(
      [
        '-h', Shellwords.escape(html),
        '-o', Shellwords.escape(outpath),
      ],
      options
    )
  end

  PDF_GENERATION_TIMEOUT = 15 * 60

  def self.invoke_generation_script(args, options = {})
    script_path = "#{deploy_dir}/bin/generate-pdf"
    cmd = (['timeout', PDF_GENERATION_TIMEOUT.to_s, 'node', script_path] + args).join(" ")
    puts cmd if options[:verbose]
    @result = `#{cmd}`
    if $?.exitstatus == 124
      raise "pdf generation timed out after #{PDF_GENERATION_TIMEOUT} seconds. cmd: #{cmd}"
    elsif $?.exitstatus != 0
      raise "pdf generation failed with status #{$?.exitstatus}. cmd: #{cmd}"
    end
    puts "  #{@result}" if options[:verbose]
  end
end
