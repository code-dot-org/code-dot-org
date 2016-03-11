# Automation for manipulating production servers.
#
# Requires the aws cli tools.  On OSX these can be installed via:
# sudo easy_install pip && sudo pip install awscli && aws configure

require 'json'
require_relative 'newrelic'

class ServerTools

  # For each of the production frontend servers whose name matches `name_glob`,
  # do all of the following:
  # - deregister it from the load balancer
  # - disable new relic alerts
  # - terminate it (requires that automatic termination protection is disabled)
  #
  # Before doing so, however, we prompt the user with the affect servers and
  # make them confirm the action.
  #
  # A manual step is still required to remove the server from the app-servers
  # attribute of cdo-secrets.
  def self.deprovision_frontends(name_glob)
    ids = find_frontend_identifiers(name_glob)

    # Make sure the user hasn't forgotten to manually remove the server from the
    # chef production environment.

    production_attributes = `knife environment show production`
    ids.each do |id|
      if !production_attributes.index("#{id.name}:").nil?
        raise "Before deprovisoning #{id.name}, you must remove it from the chef " +
              "app-servers attribute using 'knife environment edit production'."
      end
    end

    validate_ids(ids)
    return if !prompt_for_action('deregister, disable alerts, and terminate the EC2 instances', ids)

    deregister_frontends_internal(ids)
    disable_frontend_newrelic_alerts_internal(ids)
    terminate_frontends_internal(ids)
  end

  # Disables New Relic alerts for all servers whose name matches `name_glob`.
  def self.disable_frontend_newrelic_alerts(name_glob)
    ids = find_frontend_identifiers(name_glob)
    validate_ids(ids)
    return if !prompt_for_action('disable NewRelic alerts', ids)

    disable_frontend_newrelic_alerts_internal(ids)
  end

  # Enables production New Relic alerts for all servers whose name matches `name_glob`.
  def self.enable_frontend_newrelic_alerts(name_glob)
    ids = find_frontend_identifiers(name_glob)
    validate_ids(ids)
    return if !prompt_for_action('enable production NewRelic alerts', ids)

    puts "Enabling NewRelic alerts for #{ids.map(&:name).join(' ')}"
    NewRelic.enable_alerts(ids.map(&:hostname))
  end

  # Deregister the frontend instances matching `name_glob` from the production elbs.
  def self.deregister_frontends(name_glob)
    ids = find_frontend_identifiers(name_glob)
    validate_ids(ids)
    return if !prompt_for_action('deregister from the ELB', ids)
    deregister_frontends_internal(ids)
  end

  # Terminates the frontend instances matching `name_glob`. The instances must allow automatic
  # termination.
  def self.terminate_frontends(name_glob)
    ids = find_frontend_identifiers(name_glob)

    validate_ids(ids)
    return if !prompt_for_action('terminate the EC2 instances', ids)

    puts "Terminating #{ids.map(:names).join(' ')}"
    instance_ids = ids.map(:instance_id)
    puts "Instance ids: #{instance_ids.join(' ')})"
    puts `aws ec2 terminate-instances --instance-ids #{instance_ids.join(' ')}`
  end

  # A struct for bundling together the name, hostname, and instance_id for a server.
  class ServerIdentifier
    attr_accessor :name, :hostname, :instance_id

    def initialize(name:, hostname:, instance_id:)
      @name = name
      @hostname = hostname
      @instance_id = instance_id
    end
  end

  # Returns the Chef json hash for all of the servers matching `name_glob`.
  def self.find_frontends(name_glob)
    JSON.parse(
      `knife search node "roles:front-end AND chef_environment:production AND name:#{name_glob}" --format json`)['rows']
  end

  # Returns an array of ServerIdentifier records for each of the servers whose name matches `name_glob`.
  def self.find_frontend_identifiers(name_glob)
    find_frontends(name_glob).map do |fe|
      ServerIdentifier.new(name: fe['name'],
                           hostname: fe['automatic']['ec2']['hostname'],
                           instance_id: fe['automatic']['ec2']['instance_id'])
    end
  end

  # Displays a prompt asking if the user wants to `verb` all of the
  # servers matching `name_glob` and returns true if they answer 'y'.
  def self.prompt_for_action(verb, ids)
    names = ids.map(&:name)
    print "Are you sure you want to #{verb} for #{names.join(', ')}? (y/n) "
    (gets.strip == 'y')
  end

  # Raises if ids is empty or if it includes ALL server ids.
  def self.validate_ids(ids)
    raise "No matching instances" if ids.empty?
    raise "Refusing to match all instances" if ids.length == find_frontend_identifiers('*').length
  end

  def self.disable_frontend_newrelic_alerts_internal(ids)
    puts "Disabling NewRelic alerts for #{ids.map(&:name).join(' ')}"
    NewRelic.disable_alerts(ids.map(&:hostname))
    true
  end

  def self.deregister_frontends_internal(ids)
    instance_ids = ids.map(&:instance_id)
    load_balancers = %w{production-dashboard production-pegasus production-redirects}
    puts "Deregistering #{instance_ids.join(', ')} on #{load_balancers.join(', ')}"

    %w{production-dashboard production-pegasus production-redirects}.each do |elb_name|
      `aws elb deregister-instances-from-load-balancer --load-balancer-name #{elb_name} --instances #{instance_ids.join(' ')}`
    end
  end

  def self.terminate_frontends_internal(ids)
    puts "Terminating #{ids.map(&:name).join(' ')}"
    instance_ids = ids.map(&:instance_id)
    puts "Instance ids: #{instance_ids.join(' ')})"
    `aws ec2 terminate-instances --instance-ids #{instance_ids.join(' ')}`
  end

  def self.chef_app_server_config_includes?(name)
    `knife environment show production | grep -E "#{name}"` != ''
  end
end
