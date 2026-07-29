require 'aws-sdk-ec2'
require 'json'
require 'open3'

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

      class << self
        attr_writer :ec2_client
      end

      def self.ec2_client
        @ec2_client ||= ::Aws::EC2::Client.new
      end

      def self.reset_cache!
        remove_instance_variable(:@available) if instance_variable_defined?(:@available)
        remove_instance_variable(:@ec2_client) if instance_variable_defined?(:@ec2_client)
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

      def self.start_interactive_command(name_or_id, command, runner: Kernel)
        instance_id = instance_id_for(name_or_id)
        return false unless instance_id

        runner.system(*start_interactive_command_argv(instance_id, command))
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

      def self.start_interactive_command_argv(instance_id, command)
        start_session_argv(
          instance_id,
          extra_args: [
            '--document-name',
            START_INTERACTIVE_COMMAND_DOCUMENT,
            '--parameters',
            JSON.dump(command: [command])
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
      private_class_method :describe_instances
    end
  end
end
