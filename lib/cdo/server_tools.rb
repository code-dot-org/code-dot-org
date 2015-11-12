# Automation for manipulating production servers.
#
# Requires the aws cli tools.  On OSX these can be installed via:
# sudo easy_install pip && sudo pip install awscli && aws configure

require 'json'
require_relative 'newrelic'

class ServerTools

  # Returns the Chef json hash for all of the servers matching `name_glob`.
  def self.find_frontends(name_glob)
    JSON.parse(
      `knife search node "roles:front-end AND chef_environment:production AND name:#{name_glob}" --format json`)['rows']
  end

  # Returns a [name, hostname, instance_id] tuple for each of the servers whose name matches `name_glob`.
  def self.find_frontend_names(name_glob)
    find_frontends(name_glob).map {|fe| [fe['name'], fe['automatic']['ec2']['hostname'], fe['automatic']['ec2']['instance_id']]}
  end

  # Returns the instance ids of the servers whose name matches `name_glob`.
  def self.find_frontend_instance_ids(name_glob)
    find_frontend_names(name_glob).map {|t| t[2]}
  end

  # Returns the hostnames of the servers whose name matches `name_glob`.
  def self.find_frontend_hosts(name_glob)
    find_frontend_names(name_glob).map {|t| t[1]}
  end

  # Disables New Relic alerts for all servers whose name matches `name_glob`.
  def self.disable_newrelic_alerts(name_glob)
    NewRelic.disable_alerts(find_frontend_hosts(name_glob))
  end

  # Enables production New Relic alerts for all servers whose name matches `name_glob`.
  def self.enable_newrelic_alerts(name_glob)
    NewRelic.enable_alerts(find_frontend_hosts(name_glob))
  end

  # Deregister the frontend instances matching `name_glob` from the production elbs.
  def self.deregister_frontend_instances(name_glob)
    instance_ids = find_frontend_instance_ids(name_glob)
    if instance_ids.length > 0
      %w{production-dashboard production-pegasus production-redirects}.each do |elb_name|
        puts `aws elb deregister-instances-from-load-balancer --load-balancer-name #{elb_name} --instances #{instance_ids.join(' ')}`
      end
    else
      puts 'No matching instances'
    end
  end

  # Terminates the frontend instances matching `name_glob`. The instances must allow automatic
  # termination.
  def self.terminate_frontend_instances(name_glob)
    names = find_frontend_names(name_glob).map {|n| n[0]}
    print "Are you sure you want to terminate #{names.join(', ')}? (y/n) "
    input = gets
    return unless input.strip == 'y'

    instance_ids = find_frontend_instance_ids(name_glob)

    if instance_ids.length != names.length
      raise 'Unexpected error. Instance id length should equal name length.'
    end

    all_instance_ids = find_frontend_instance_ids('*')

    if instance_ids.length == all_instance_ids.length
      puts "Refusing to terminate all instances"
      return
    end

    if instance_ids.length > 0
      puts "Terminating #{instance_ids.join(' ')}"
      puts `aws ec2 terminate-instances --instance-ids #{instance_ids.join(' ')}`
    else
      puts 'No matching instances'
    end
  end

end
