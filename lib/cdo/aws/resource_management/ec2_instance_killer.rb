class EC2InstanceKiller < AwsResourceKiller
  def initialize(opts = {})
    @filters = opts[:aws_filters]
    @deletion_tag = opts[:deletion_tag]
    @minimum_time_stopped_in_seconds = opts[:deletion_tag]
    @dry_run = true
  end

  # Find all the instances that need to be deleted
  def find_instances_for_deletion
    instances = Aws::EC2::Resource.new.instances(filters: @filters)
    instances_that_can_be_deleted = []
    instances.each do |instance|
      ec2_instance = EC2InstanceForDeletion(instance, {deletion_tag: @deletion_tag, minimum_time_stopped_in_seconds: @minimum_time_stopped_in_seconds, dry_run: @dry_run})
      next unless ec2_instance.can_be_deleted?
      instances_that_can_be_deleted << ec2_instance
    end
    return instances_that_can_be_deleted
  end

  def tag_instances_for_deletion(instances_to_delete)
    instances_to_tag = []
    tagged_instances = []
    instances_to_delete.each do |instance|
      if instance.has_deletion_tag
        tagged_instances << instance
        next
      end
      instances_to_tag << instance
    end
    instances_to_tag.each(&:tag_for_deletion)
    return (tagged_instances << instances_to_tag).flatten
  end

  def delete_tagged_instances(instances_to_delete)
    if @dry_run
      log("Pretending to delete instances")
      return
    end

    instances_to_delete.each do |instance|
      if instance.can_be_deleted? && instance.has_deletion_tag?(tag)
        instance.delete
      end
    end
  end
end
