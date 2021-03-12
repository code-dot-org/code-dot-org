require 'aws-sdk-ec2'

module Cdo::CloudFormation
  # Helper functions related to adhoc instances of CdoApp,
  # included AWS::CloudFormation in adhoc environment.
  module Adhoc
    def start_inactive_instance
      if instance.state.name != 'stopped'
        log.info "Instance #{instance.id} in Stack #{stack_name} can't be started because it is not" \
            " currently stopped.  Current state - #{instance.state.name}"
      else
        log.info "Starting Instance #{instance.id} ..."
        options[:quiet] = true
        stack.options[:start_inactive_instance] = true
        create_or_update
      end
      cfn_stack.outputs.each do |output|
        log.info "#{output.output_key}: #{output.output_value}"
      end
    end

    def stop
      log.info "Finding EC2 Instance for CloudFormation Stack #{stack_name} ..."
      if !instance.exists?
        log.info "Instance #{instance_id} does not exist or has been terminated."\
              "Delete this unrecoverable CloudFormation stack: rake adhoc:delete STACK_NAME=#{stack_name}"
      elsif instance.state.name == 'stopped'
        log.info "Instance #{instance.id} is already Stopped."
      elsif instance.state.name == 'running'
        log.info "Stopping Instance #{instance.id} ..."
        stop_result = instance.stop
        log.info "Instance Status - #{stop_result.stopping_instances[0].current_state.name}"
        log.info "Waiting until Stopped ..."
        instance.wait_until_stopped
        log.info "Instance Status - #{instance.reload.state.name}"
        log.info "To start instance: rake adhoc:start_inactive_instance STACK_NAME=#{stack_name}"
      else
        log.info "Cannot stop Instance because its state is #{instance.state.name}"
      end
    end

    def cfn_stack
      @cfn_stack ||= Aws::CloudFormation::Stack.new(stack_name)
    end

    def instance
      @instance ||= Aws::EC2::Instance.new(id: cfn_stack.resource('WebServer').physical_resource_id)
    end
  end
end
