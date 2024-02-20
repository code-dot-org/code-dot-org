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

  def self.invoke_generation_script(args, options = {}, retry_attempts: 3)
    script_path = "#{deploy_dir}/bin/generate-pdf"
    cmd = (['timeout', PDF_GENERATION_TIMEOUT.to_s, 'node', script_path] + args).join(" ")
    puts cmd if options[:verbose]
    @result = `#{cmd}`
    if $?.exitstatus == 124
      raise "pdf generation timed out after #{PDF_GENERATION_TIMEOUT} seconds. cmd: #{cmd}"
    elsif $?.exitstatus == 1
      # We have had inconsistent issues with pdf generation timing out thus here 
      # we are re-attempting generation using recursion.  We considered using a loop
      # instead of reucursion, but the code was less readable or had side effects that 
      # were not addressing this specific issue with time out. We do not see an issue 
      # with performance in this case.
      if retry_attempts <= 1
        raise "pdf generation failed with status #{$?.exitstatus}. cmd: #{cmd}" 
      else
        warn "Exit status 1.  Re-attempting."
        invoke_generation_script(args, options, retry_attempts: retry_attempts - 1)
      end
    elsif $?.exitstatus != 0
      raise "pdf generation failed with status #{$?.exitstatus}. cmd: #{cmd}"
    end
    puts "  #{@result}" if options[:verbose]
  end
end
