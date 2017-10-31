require 'open3'

CODEORG_CONFIG_FILE = File.join(File.dirname(__FILE__), "codeorg_crowdin.yml")
CODEORG_IDENTITY_FILE = File.join(File.dirname(__FILE__), "codeorg_credentials.yml")
HOUROFCODE_CONFIG_FILE = File.join(File.dirname(__FILE__), "hourofcode_crowdin.yml")
HOUROFCODE_IDENTITY_FILE = File.join(File.dirname(__FILE__), "hourofcode_credentials.yml")

def run_standalone_script(location)
  Open3.popen3(location) do |_stdin, stdout, stderr, _wait_thread|
    while line = stdout.gets
      puts(line)
    end
    while line = stderr.gets
      puts(line)
    end
  end
end

def run_bash_script(location)
  run_standalone_script("bash #{location}")
end
