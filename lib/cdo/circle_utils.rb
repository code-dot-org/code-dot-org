module CircleUtils
  def self.system_stream_output(command)
    CDO.log.info command
    system(command)
    unless $?.exitstatus == 0
      error = RuntimeError.new("'#{command}' returned #{status}")
      raise error, error.message
    end
  end
end
