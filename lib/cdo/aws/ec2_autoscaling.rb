require 'aws-sdk-autoscaling'

module AWS
  class EC2Autoscaling
    # Refresh the instances in the autoscaling group for the current environment.
    def self.refresh_instances
      refresh_instances_in_group(get_autoscaling_group_for_current_environment)
    end

    # Refresh the instances in the autoscaling group with the given name.
    #
    # @param [String] group_name The name of the autoscaling group to refresh.
    # @param [Boolean] wait Whether to wait for the instance refresh to complete.
    def self.refresh_instances_in_group(group_name, wait: false)
      asg = Aws::AutoScaling::Client.new

      groups_matching_name = asg.describe_auto_scaling_groups(auto_scaling_group_names: [group_name]).auto_scaling_groups
      raise "No AutoScaling group found with name #{group_name}" if groups_matching_name.empty?
      raise "Multiple AutoScaling groups found with name \"#{group_name}\"" if groups_matching_name.length > 1

      asg.start_instance_refresh(
        auto_scaling_group_name: group_name,
        preferences: {
          min_healthy_percentage: 100,
          max_healthy_percentage: 200,
          instance_warmup: 0
        }
      )

      return unless wait
      asg.wait_until(:instances_healthy, auto_scaling_group_names: [group_name])
    end

    # Finds the name of the autoscaling group for the current environment.
    #
    # @return [String] The name of the autoscaling group for the current environment.
    # @raise [RuntimeError] If no autoscaling group is found for the current environment.
    def self.get_autoscaling_group_for_current_environment
      stack_name = CDO.stack_name
      logical_id = 'Frontends'

      puts "fetching autoscaling group for stack: #{stack_name} and logical id: #{logical_id}"

      asg_client = Aws::AutoScaling::Client.new

      group = asg_client.describe_auto_scaling_groups.auto_scaling_groups.find do |g|
        has_stack_name = g.tags&.any? {|tag| tag.key == 'aws:cloudformation:stack-name' && tag.value == stack_name}
        has_logical_id = g.tags&.any? {|tag| tag.key == 'aws:cloudformation:logical-id' && tag.value == logical_id}
        has_stack_name && has_logical_id
      end

      raise "No AutoScaling group found for stack \"#{stack_name}\" and logical id \"#{logical_id}\"" unless group

      group&.auto_scaling_group_name
    end
  end
end
