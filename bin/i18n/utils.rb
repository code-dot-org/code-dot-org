require 'open3'

def run_bash_script(location)
  Open3.popen3("sh #{location}") do |_stdin, stdout, _stderr, _wait_thread|
    while line = stdout.gets
      puts(line)
    end
  end
end
