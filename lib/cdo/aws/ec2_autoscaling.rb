require 'aws-sdk-autoscaling'

module AWS
  class EC2Autoscaling
    def self.refresh_instances(auto_scaling_group_name, wait: false)
      asg = Aws::AutoScaling::Client.new

      groups_matching_name = asg.describe_auto_scaling_groups(auto_scaling_group_names: [auto_scaling_group_name]).auto_scaling_groups
      raise "No AutoScaling group found with name #{auto_scaling_group_name}" if groups_matching_name.empty?
      raise "Multiple AutoScaling groups found with name \"#{auto_scaling_group_name}\"" if groups_matching_name.length > 1

      asg.start_instance_refresh(auto_scaling_group_name: auto_scaling_group_name)

      return unless wait
      asg.wait_until(:instances_healthy, auto_scaling_group_names: [auto_scaling_group_name])
    end
  end
end
