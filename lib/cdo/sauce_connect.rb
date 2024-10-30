require 'open3'
require 'timeout'

# Starts the Sauce Connect Proxy

module Cdo
  module SauceConnect
    # How many seconds to wait for the "you may start your tests" message
    SC_START_TIMEOUT_S = 120
    SC_START_MESSAGE = "you may start your tests"
    SC_STDOUT_PREFIX = "Sauce Connect Proxy"

    @pid = nil

    class << self
      # Starts the Sauce Connect Proxy, which allows tunneling connections from our local server to Sauce Labs
      # This method blocks until sc prints the "you may start your tests" message to log/sc.log
      #
      # @param [Boolean] daemonize - if true, sc will continue running in the bg even when ruby exits
      def start_sauce_connect(daemonize: false)
        log_file = open_log_file

        # Verify that required parameters are set in locals.yml
        raise "saucelabs_username must be set in locals.yml" unless CDO.saucelabs_username
        raise "saucelabs_authkey must be set in locals.yml, use 'Access Key' from https://app.saucelabs.com/user-settings" unless CDO.saucelabs_authkey
        raise "saucelabs_tunnel_name must be set in locals.yml, 'cdo-tunnel' is a good default choice" unless CDO.saucelabs_tunnel_name

        # Regexes defining the localhost domains we want to tunnel:
        tunnel_domains = [
          %q(.*\.code.org),
          %q(.*\.csedweek.org),
          %q(.*\.hourofcode.com),
          %q(.*\.codeprojects.org),
        ].join(',')

        cmd = [
          "sc", "run",
          "--region", "us-west-1",
          "--tunnel-domains", tunnel_domains,
          "--tunnel-name", CDO.saucelabs_tunnel_name,
        ]

        env = {
          "SAUCE_USERNAME" => CDO.saucelabs_username,
          "SAUCE_ACCESS_KEY" => CDO.saucelabs_authkey
        }

        @pid = Process.spawn(env, *cmd, out: log_file.path, err: log_file.path)
        log "starting sc, pid = #{@pid}, see log at #{log_file.path}"

        # Block waiting for `sc` to print "you may start your tests"
        tests_started, log_lines = tests_started?(log_file)

        if tests_started == :success
          log "SUCCESS, sc is running#{" in the background, you can stop it with `killall sc`" if daemonize}"

          at_exit {stop_sauce_connect} unless daemonize

          return @pid
        else
          puts
          puts "Log:"
          puts log_lines.map {|line| "  #{line}"}.join
          puts
          if tests_started == :timeout
            log "ERROR: timed out waiting #{SC_START_TIMEOUT_S} seconds for '#{SC_START_MESSAGE}', stopping sc"
            stop_sauce_connect
          else
            log "ERROR: couldn't start sc"
          end
        end
      ensure
        log_file.close
      end

      def stop_sauce_connect
        Process.kill("TERM", @pid) # kill sc process
      rescue Errno::ESRCH
      end

      private def open_log_file
        log_file_path = deploy_dir('log/sc.log')
        FileUtils.mkdir_p File.dirname(log_file_path) # create log dir if it doesn't exist
        File.open(log_file_path, 'a+') # open log file, create if it doesn't exist, seek to the end
      end

      private def process_exited?
        Process.waitpid(@pid, Process::WNOHANG)
      end

      # Scan the log output of sc looking for the "you may start your tests" message
      # timeout if more than SC_START_TIMEOUT_S seconds pass without seeing the message
      private def tests_started?(log_file)
        lines = []
        Timeout.timeout(SC_START_TIMEOUT_S) do
          # Keep reading from the end of log_file unless the process exits
          until process_exited?
            sleep 0.1
            while (line = log_file.gets)
              lines << line
              if line.strip.end_with?(SC_START_MESSAGE)
                return :success, lines
              end
            end
          end
          lines << log_file.readlines # read any remaining lines
        end
        return :failure, lines
      rescue Timeout::Error
        return :timeout, lines
      end

      private def log(message)
        puts "#{SC_STDOUT_PREFIX}: #{message}"
      end
    end
  end
end
