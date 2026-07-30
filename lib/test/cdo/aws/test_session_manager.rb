require 'minitest/autorun'
require 'mocha/mini_test'
require 'aws-sdk-ec2'
require 'aws-sdk-secretsmanager'
require 'json'
require 'shellwords'

$LOAD_PATH.unshift File.expand_path('../../..', __dir__)
require 'cdo/aws/session_manager'
require 'cdo/secrets'

class CdoAwsSessionManagerTest < Minitest::Test
  Status = Struct.new(:success) do
    def success?
      success
    end
  end

  def setup
    Cdo::Aws::SessionManager.reset_cache!
  end

  def teardown
    Cdo::Aws::SessionManager.reset_cache!
  end

  def test_instance_id_for_returns_instance_ids_without_ec2_lookup
    ec2_client = mock
    ec2_client.expects(:describe_instances).never
    Cdo::Aws::SessionManager.ec2_client = ec2_client

    assert_equal(
      'i-0123456789abcdef0',
      Cdo::Aws::SessionManager.instance_id_for('i-0123456789abcdef0')
    )
  end

  def test_instance_id_for_treats_i_dash_prefix_as_an_instance_id
    ec2_client = mock
    ec2_client.expects(:describe_instances).never
    Cdo::Aws::SessionManager.ec2_client = ec2_client

    assert_equal 'i-staging', Cdo::Aws::SessionManager.instance_id_for('i-staging')
  end

  def test_cdo_aws_namespace_does_not_shadow_aws_sdk_secrets_manager
    assert_equal(
      ::Aws::SecretsManager::Errors::ResourceNotFoundException,
      Cdo::Secrets::NOT_FOUND
    )
  end

  def test_instance_id_for_returns_first_instance_matching_name_tag
    ec2_client = stubbed_ec2_client(
      reservations: [
        {
          instances: [
            {instance_id: 'i-aaaaaaaaaaaaaaaaa'},
            {instance_id: 'i-bbbbbbbbbbbbbbbbb'}
          ]
        }
      ]
    )
    Cdo::Aws::SessionManager.ec2_client = ec2_client

    assert_equal 'i-aaaaaaaaaaaaaaaaa', Cdo::Aws::SessionManager.instance_id_for('staging')
    assert_equal(
      {
        filters: [
          {
            name: 'tag:Name',
            values: %w[
              staging
            ]
          }
        ]
      },
      ec2_client.api_requests.first[:params]
    )
  end

  def test_instance_id_for_returns_nil_when_no_instance_matches
    Cdo::Aws::SessionManager.ec2_client = stubbed_ec2_client(reservations: [])

    assert_nil Cdo::Aws::SessionManager.instance_id_for('missing')
  end

  def test_availability_zone_for_returns_instance_placement
    ec2_client = stubbed_ec2_client(
      reservations: [
        {
          instances: [
            {
              instance_id: 'i-aaaaaaaaaaaaaaaaa',
              placement: {availability_zone: 'us-east-1d'}
            }
          ]
        }
      ]
    )
    Cdo::Aws::SessionManager.ec2_client = ec2_client

    assert_equal(
      'us-east-1d',
      Cdo::Aws::SessionManager.availability_zone_for('i-aaaaaaaaaaaaaaaaa')
    )
    assert_equal(
      {
        instance_ids: %w[
          i-aaaaaaaaaaaaaaaaa
        ]
      },
      ec2_client.api_requests.first[:params]
    )
  end

  def test_running_instance_completion_candidates_returns_ids_and_names
    ec2_client = stubbed_ec2_client(
      reservations: [
        {
          instances: [
            {
              instance_id: 'i-aaaaaaaaaaaaaaaaa',
              tags: [{key: 'Name', value: 'staging'}]
            },
            {
              instance_id: 'i-bbbbbbbbbbbbbbbbb',
              tags: [{key: 'Name', value: 'test'}, {key: 'Owner', value: 'infra'}]
            }
          ]
        }
      ]
    )
    Cdo::Aws::SessionManager.ec2_client = ec2_client

    assert_equal(
      %w[
        i-aaaaaaaaaaaaaaaaa
        staging
        i-bbbbbbbbbbbbbbbbb
        test
      ],
      Cdo::Aws::SessionManager.running_instance_completion_candidates
    )
    assert_equal(
      {
        filters: [
          {
            name: 'tag-key',
            values: %w[
              Name
            ]
          },
          {
            name: 'instance-state-name',
            values: %w[
              running
            ]
          }
        ]
      },
      ec2_client.api_requests.first[:params]
    )
  end

  def test_available_returns_true_when_aws_cli_v2_and_plugin_are_installed
    Open3.expects(:capture3).with('aws', '--version').returns(
      ['aws-cli/2.34.44 Python/3.14.4', '', Status.new(true)]
    )
    Open3.expects(:capture3).with('session-manager-plugin', '--version').returns(
      ['1.2.814.0', '', Status.new(true)]
    )

    assert Cdo::Aws::SessionManager.available?
  end

  def test_available_returns_false_for_aws_cli_v1
    Open3.expects(:capture3).with('aws', '--version').returns(
      ['aws-cli/1.45.10 Python/3.11.0', '', Status.new(true)]
    )
    Open3.expects(:capture3).with('session-manager-plugin', '--version').never

    refute Cdo::Aws::SessionManager.available?
  end

  def test_start_session_argv_includes_extra_args
    assert_equal(
      %w[
        aws
        ssm
        start-session
        --target
        i-aaaaaaaaaaaaaaaaa
        --reason
        debugging
      ],
      Cdo::Aws::SessionManager.start_session_argv(
        'i-aaaaaaaaaaaaaaaaa',
        extra_args: %w[
          --reason
          debugging
        ]
      )
    )
  end

  def test_start_interactive_command_argv_uses_command_parameter_json
    argv = Cdo::Aws::SessionManager.start_interactive_command_argv(
      'i-aaaaaaaaaaaaaaaaa',
      'test/bin/terminate_build'
    )

    assert_equal(
      %w[
        aws
        ssm
        start-session
        --target
        i-aaaaaaaaaaaaaaaaa
        --document-name
        AWS-StartInteractiveCommand
        --parameters
      ],
      argv.first(8)
    )
    assert_equal(
      wrapped_command('test/bin/terminate_build'),
      command_parameter(argv)
    )
  end

  def test_start_interactive_command_argv_can_override_user_and_working_directory
    argv = Cdo::Aws::SessionManager.start_interactive_command_argv(
      'i-aaaaaaaaaaaaaaaaa',
      'test/bin/terminate_build',
      instance_os_user: 'deploy',
      working_directory: '/srv/deploy'
    )

    assert_equal(
      wrapped_command(
        'test/bin/terminate_build',
        instance_os_user: 'deploy',
        working_directory: '/srv/deploy'
      ),
      command_parameter(argv)
    )
  end

  def test_start_interactive_command_argv_can_skip_remote_shell_context
    argv = Cdo::Aws::SessionManager.start_interactive_command_argv(
      'i-aaaaaaaaaaaaaaaaa',
      'uptime',
      instance_os_user: nil,
      working_directory: nil
    )

    assert_equal 'uptime', command_parameter(argv)
  end

  def test_start_interactive_shell_argv_starts_ubuntu_login_shell_from_home
    argv = Cdo::Aws::SessionManager.start_interactive_shell_argv(
      'i-aaaaaaaaaaaaaaaaa',
      extra_args: %w[
        --reason
        debugging
      ]
    )

    assert_equal(
      wrapped_command('exec bash -l'),
      command_parameter(argv)
    )
    assert_equal(
      %w[
        --reason
        debugging
      ],
      argv.last(2)
    )
  end

  def test_start_ssh_session_argv_uses_port_number_parameter_json
    assert_equal(
      %w[
        aws
        ssm
        start-session
        --target
        i-aaaaaaaaaaaaaaaaa
        --document-name
        AWS-StartSSHSession
        --parameters
        {"portNumber":["22"]}
      ],
      Cdo::Aws::SessionManager.start_ssh_session_argv(
        instance_id: 'i-aaaaaaaaaaaaaaaaa',
        port: 22
      )
    )
  end

  def test_send_ssh_public_key_argv_uses_ec2_instance_connect
    assert_equal(
      %w[
        aws
        ec2-instance-connect
        send-ssh-public-key
        --instance-id
        i-aaaaaaaaaaaaaaaaa
        --availability-zone
        us-east-1d
        --instance-os-user
        ubuntu
        --ssh-public-key
        file:///tmp/key.pub
      ],
      Cdo::Aws::SessionManager.send_ssh_public_key_argv(
        instance_id: 'i-aaaaaaaaaaaaaaaaa',
        availability_zone: 'us-east-1d',
        instance_os_user: 'ubuntu',
        public_key_path: '/tmp/key.pub'
      )
    )
  end

  def test_start_interactive_command_returns_false_when_instance_is_not_found
    Cdo::Aws::SessionManager.ec2_client = stubbed_ec2_client(reservations: [])
    runner = mock
    runner.expects(:system).never

    refute Cdo::Aws::SessionManager.start_interactive_command('missing', 'uptime', runner: runner)
  end

  def test_start_interactive_command_runs_resolved_command_argv
    Cdo::Aws::SessionManager.ec2_client = stubbed_ec2_client(
      reservations: [
        {
          instances: [
            {instance_id: 'i-aaaaaaaaaaaaaaaaa'}
          ]
        }
      ]
    )
    runner = mock
    runner.expects(:system).with(
      *Cdo::Aws::SessionManager.start_interactive_command_argv('i-aaaaaaaaaaaaaaaaa', 'uptime')
    ).returns(true)

    assert Cdo::Aws::SessionManager.start_interactive_command('staging', 'uptime', runner: runner)
  end

  def test_start_interactive_shell_runs_resolved_shell_argv
    Cdo::Aws::SessionManager.ec2_client = stubbed_ec2_client(
      reservations: [
        {
          instances: [
            {instance_id: 'i-aaaaaaaaaaaaaaaaa'}
          ]
        }
      ]
    )
    runner = mock
    runner.expects(:system).with(
      *Cdo::Aws::SessionManager.start_interactive_shell_argv(
        'i-aaaaaaaaaaaaaaaaa',
        extra_args: %w[
          --reason
          debugging
        ]
      )
    ).returns(true)

    assert(
      Cdo::Aws::SessionManager.start_interactive_shell(
        'staging',
        extra_args: %w[
          --reason
          debugging
        ],
        runner: runner
      )
    )
  end

  private def stubbed_ec2_client(describe_instances_response)
    client = Aws::EC2::Client.new(stub_responses: true)
    client.stub_responses(:describe_instances, describe_instances_response)
    client
  end

  private def command_parameter(argv)
    parameters_index = argv.index('--parameters')
    JSON.parse(argv.fetch(parameters_index + 1)).fetch('command').first
  end

  private def wrapped_command(
    command,
    instance_os_user: Cdo::Aws::SessionManager::DEFAULT_INSTANCE_OS_USER,
    working_directory: Cdo::Aws::SessionManager::DEFAULT_WORKING_DIRECTORY
  )
    Shellwords.join(
      [
        'sudo',
        '-Hu',
        instance_os_user,
        'bash',
        '-lc',
        "cd #{Shellwords.escape(working_directory)} && #{command}"
      ]
    )
  end
end
