require 'aws-sdk-ec2'
require 'aws-sdk-ssm'
require 'json'
require 'open3'
require 'shellwords'

module Cdo
  module Aws
    # Helpers for opening AWS Systems Manager Session Manager sessions.
    #
    # The AWS SDK can start a session, but it only returns the stream URL and
    # token. The local AWS CLI and Session Manager plugin still own the
    # interactive terminal stream, so this module uses the SDK for EC2 lookups
    # and keeps session launch as an argv-building boundary.
    module SessionManager
      INSTALL_PLUGIN_URL = (
        'https://docs.aws.amazon.com/systems-manager/latest/userguide/' \
        'session-manager-working-with-install-plugin.html'
      ).freeze
      START_INTERACTIVE_COMMAND_DOCUMENT = 'AWS-StartInteractiveCommand'.freeze
      START_SSH_SESSION_DOCUMENT = 'AWS-StartSSHSession'.freeze
      RUN_SHELL_SCRIPT_DOCUMENT = 'AWS-RunShellScript'.freeze
      DEFAULT_INSTANCE_OS_USER = 'ubuntu'.freeze
      DEFAULT_WORKING_DIRECTORY = "/home/#{DEFAULT_INSTANCE_OS_USER}".freeze
      LOGIN_SHELL_COMMAND = 'exec bash -l'.freeze

      # An invocation sits in one of these states until the agent finishes; see
      # https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetCommandInvocation.html
      COMMAND_PENDING_STATUSES = %w[Pending InProgress Delayed].freeze
      DEFAULT_COMMAND_POLL_INTERVAL = 2
      DEFAULT_COMMAND_TIMEOUT_SECONDS = 3600

      class << self
        attr_writer :ec2_client, :ssm_client
      end

      def self.ec2_client
        @ec2_client ||= ::Aws::EC2::Client.new
      end

      def self.ssm_client
        @ssm_client ||= ::Aws::SSM::Client.new
      end

      def self.reset_cache!
        remove_instance_variable(:@available) if instance_variable_defined?(:@available)
        remove_instance_variable(:@ec2_client) if instance_variable_defined?(:@ec2_client)
        remove_instance_variable(:@ssm_client) if instance_variable_defined?(:@ssm_client)
      end

      def self.available?
        return @available if defined?(@available)

        @available = aws_cli_v2? && session_manager_plugin_installed?
      end

      def self.aws_cli_v2?
        stdout, stderr, status = Open3.capture3('aws', '--version')
        status.success? && "#{stdout}#{stderr}".start_with?('aws-cli/2.')
      rescue Errno::ENOENT
        false
      end

      def self.session_manager_plugin_installed?
        _stdout, _stderr, status = Open3.capture3('session-manager-plugin', '--version')
        status.success?
      rescue Errno::ENOENT
        false
      end

      def self.instance_id?(name_or_id)
        name_or_id.start_with?('i-')
      end

      def self.instance_id_for(name_or_id)
        return name_or_id if instance_id?(name_or_id)

        instances = describe_instances(
          filters: [
            {name: 'tag:Name', values: [name_or_id]}
          ]
        )
        instances.first&.instance_id
      end

      def self.availability_zone_for(instance_id)
        describe_instances(instance_ids: [instance_id]).first&.placement&.availability_zone
      end

      def self.running_instance_completion_candidates
        describe_instances(
          filters: [
            {name: 'tag-key', values: ['Name']},
            {name: 'instance-state-name', values: ['running']}
          ]
        ).flat_map do |instance|
          name_tags = Array(instance.tags).
            select {|tag| tag.key == 'Name'}.
            map(&:value).
            compact
          [instance.instance_id, *name_tags]
        end.uniq
      end

      def self.start_session(name_or_id, extra_args: [], runner: Kernel)
        instance_id = instance_id_for(name_or_id)
        return false unless instance_id

        runner.system(*start_session_argv(instance_id, extra_args: extra_args))
      end

      def self.start_interactive_shell(
        name_or_id,
        instance_os_user: DEFAULT_INSTANCE_OS_USER,
        working_directory: DEFAULT_WORKING_DIRECTORY,
        extra_args: [],
        runner: Kernel
      )
        instance_id = instance_id_for(name_or_id)
        return false unless instance_id

        runner.system(
          *start_interactive_shell_argv(
            instance_id,
            instance_os_user: instance_os_user,
            working_directory: working_directory,
            extra_args: extra_args
          )
        )
      end

      # Opens an interactive session running +command+. The return value only
      # reports whether the session itself started and closed; the Session
      # Manager plugin discards the remote command's exit status, so it cannot
      # tell success from failure (https://github.com/aws/session-manager-plugin/issues/59).
      # Use #run_command when the caller needs the remote exit status.
      def self.start_interactive_command(
        name_or_id,
        command,
        instance_os_user: DEFAULT_INSTANCE_OS_USER,
        working_directory: DEFAULT_WORKING_DIRECTORY,
        extra_args: [],
        runner: Kernel
      )
        instance_id = instance_id_for(name_or_id)
        return false unless instance_id

        runner.system(
          *start_interactive_command_argv(
            instance_id,
            command,
            instance_os_user: instance_os_user,
            working_directory: working_directory,
            extra_args: extra_args
          )
        )
      end

      # Runs +command+ through SSM Run Command and returns true only when the
      # remote command exits zero. Run Command reports the real exit status
      # (ResponseCode), which an interactive session cannot. There is no live
      # stream, so captured stdout/stderr print once the command finishes.
      #
      # @return [Boolean] true if the remote command exited zero, else false.
      def self.run_command(
        name_or_id,
        command,
        instance_os_user: DEFAULT_INSTANCE_OS_USER,
        working_directory: DEFAULT_WORKING_DIRECTORY,
        out: $stdout,
        err: $stderr,
        poll_interval: DEFAULT_COMMAND_POLL_INTERVAL,
        timeout: DEFAULT_COMMAND_TIMEOUT_SECONDS,
        sleeper: Kernel
      )
        instance_id = instance_id_for(name_or_id)
        return false unless instance_id

        command_id = ssm_client.send_command(
          instance_ids: [instance_id],
          document_name: RUN_SHELL_SCRIPT_DOCUMENT,
          parameters: {
            'commands' => [
              remote_command(
                command,
                instance_os_user: instance_os_user,
                working_directory: working_directory
              )
            ]
          },
          timeout_seconds: timeout
        ).command.command_id

        invocation = wait_for_command(
          instance_id,
          command_id,
          poll_interval: poll_interval,
          timeout: timeout,
          sleeper: sleeper
        )

        out.print invocation.standard_output_content unless invocation.standard_output_content.to_s.empty?
        err.print invocation.standard_error_content unless invocation.standard_error_content.to_s.empty?
        invocation.response_code&.zero? || false
      rescue ::Aws::SSM::Errors::InvalidInstanceId
        err.puts "#{name_or_id} is not a running SSM-managed instance"
        false
      end

      def self.send_ssh_public_key(
        instance_id:,
        availability_zone:,
        instance_os_user:,
        public_key_path:,
        runner: Kernel
      )
        runner.system(
          *send_ssh_public_key_argv(
            instance_id: instance_id,
            availability_zone: availability_zone,
            instance_os_user: instance_os_user,
            public_key_path: public_key_path
          )
        )
      end

      def self.start_session_argv(instance_id, extra_args: [])
        ['aws', 'ssm', 'start-session', '--target', instance_id, *extra_args]
      end

      def self.start_interactive_shell_argv(
        instance_id,
        instance_os_user: DEFAULT_INSTANCE_OS_USER,
        working_directory: DEFAULT_WORKING_DIRECTORY,
        extra_args: []
      )
        start_interactive_command_argv(
          instance_id,
          LOGIN_SHELL_COMMAND,
          instance_os_user: instance_os_user,
          working_directory: working_directory,
          extra_args: extra_args
        )
      end

      def self.start_interactive_command_argv(
        instance_id,
        command,
        instance_os_user: DEFAULT_INSTANCE_OS_USER,
        working_directory: DEFAULT_WORKING_DIRECTORY,
        extra_args: []
      )
        start_session_argv(
          instance_id,
          extra_args: [
            '--document-name',
            START_INTERACTIVE_COMMAND_DOCUMENT,
            '--parameters',
            JSON.dump(
              command: [
                remote_command(
                  command,
                  instance_os_user: instance_os_user,
                  working_directory: working_directory
                )
              ]
            ),
            *extra_args
          ]
        )
      end

      def self.start_ssh_session_argv(instance_id:, port:)
        start_session_argv(
          instance_id,
          extra_args: [
            '--document-name',
            START_SSH_SESSION_DOCUMENT,
            '--parameters',
            JSON.dump(portNumber: [port.to_s])
          ]
        )
      end

      def self.send_ssh_public_key_argv(
        instance_id:,
        availability_zone:,
        instance_os_user:,
        public_key_path:
      )
        [
          'aws',
          'ec2-instance-connect',
          'send-ssh-public-key',
          '--instance-id',
          instance_id,
          '--availability-zone',
          availability_zone,
          '--instance-os-user',
          instance_os_user,
          '--ssh-public-key',
          "file://#{public_key_path}"
        ]
      end

      def self.describe_instances(**params)
        ec2_client.describe_instances(params).reservations.flat_map(&:instances)
      end

      def self.remote_command(command, instance_os_user: nil, working_directory: nil)
        command = "cd #{Shellwords.escape(working_directory)} && #{command}" if working_directory
        return command unless instance_os_user

        Shellwords.join(['sudo', '-Hu', instance_os_user, 'bash', '-lc', command])
      end

      # Polls until the invocation reaches a terminal status, then returns it.
      def self.wait_for_command(instance_id, command_id, poll_interval:, timeout:, sleeper:)
        deadline = monotonic_time + timeout
        loop do
          invocation = command_invocation(instance_id, command_id)
          return invocation if invocation && !COMMAND_PENDING_STATUSES.include?(invocation.status)

          if monotonic_time >= deadline
            raise CommandTimeoutError, "SSM command #{command_id} on #{instance_id} did not finish within #{timeout}s"
          end

          sleeper.sleep(poll_interval)
        end
      end

      # Returns the invocation, or nil while the agent has not registered it yet.
      def self.command_invocation(instance_id, command_id)
        ssm_client.get_command_invocation(command_id: command_id, instance_id: instance_id)
      rescue ::Aws::SSM::Errors::InvocationDoesNotExist
        nil
      end

      def self.monotonic_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end

      class CommandTimeoutError < StandardError; end

      private_class_method :describe_instances, :remote_command, :wait_for_command,
        :command_invocation, :monotonic_time
    end
  end
end
