require 'open3'

def run_standalone_script(location)
  Open3.popen3(location) do |_stdin, stdout, _stderr, _wait_thread|
    while line = stdout.gets
      puts(line)
    end
  end
end

def run_bash_script(location)
  run_standalone_script("sh #{location}")
end
