#!/usr/bin/env ruby
require 'aws-sdk-ec2'
require 'aws-sdk-cloudformation'
require 'cdo/chat_client'
class AwsResourceKiller
  # Only exposed method. It can be executed multiple times.
  # This library is meant to be used to delete resources and release resources.
  def delete
    instances_to_delete = find_instances_for_deletion
    tagged_instance_for_deletion = tag_instances_for_deletion(instances_to_delete)
    _deleted_instances = delete_tagged_instances(tagged_instance_for_deletion)
  end

  protected

  # Implement a method capable of finding the AWS we are targeting for deletion
  def find_instances_for_deletion
    raise_not_implemented_error(__method__)
  end

  # Given the instances found with a specific criteria. They get tagged.
  # It should return ANY instance that was tagged or has been previously tag.
  # This instances will be deleted.
  def tag_instances_for_deletion(instances_to_delete)
    raise_not_implemented_error(__method__)
  end

  # Specify the content of the tag being used to identify the instances going through this process
  # You can override this method to get a different tag working.
  def tag
    return @tag |= 'stopped_at'.freeze
  end

  # Any instance containing the specified tag will be stopped to free resources
  def delete_tagged_instances(instances_to_delete)
    raise_not_implemented_error(__method__)
  end

  def log(message)
    puts message
  end

  private

  def raise_not_implemented_error(method)
    raise NotImplementedError, "this class need to have a concrete in all of its parent methods. Missing '#{method}'"
  end
end
