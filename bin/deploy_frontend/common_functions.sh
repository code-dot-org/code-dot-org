#!/bin/bash
# ELB and ASG lifecycle event scripts
# Original from: https://github.com/awslabs/aws-codedeploy-samples/tree/master/load-balancing/elb
#
# Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# A copy of the License is located at
#
#  http://aws.amazon.com/apache2.0
#
# or in the "license" file accompanying this file. This file is distributed
# on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied. See the License for the specific language governing
# permissions and limitations under the License.

# ELB_LIST defines which Elastic Load Balancers this instance should be part of.
# The elements in ELB_LIST should be separated by space.
# Set to "all" to automatically use all load balancers the instance is registered to.
ELB_LIST="all"

# Under normal circumstances, you shouldn't need to change anything below this line.
# -----------------------------------------------------------------------------

export PATH="$PATH:/usr/bin:/usr/local/bin"

# If true, all messages will be printed. If false, only fatal errors are printed.
DEBUG=true

# Number of times to check for a resouce to be in the desired state.
WAITER_ATTEMPTS=180

# Number of seconds to wait between attempts for resource to be in a state.
WAITER_INTERVAL=1

# AutoScaling Standby features at minimum require this version to work.
MIN_CLI_VERSION='1.3.25'

# Usage: get_instance_region
#
#   Writes to STDOUT the AWS region as known by the local instance.
get_instance_region() {
    if [ -z "$AWS_REGION" ]; then
        AWS_REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document \
            | grep -i region \
            | awk -F\" '{print $4}')
    fi

    echo $AWS_REGION
}

AWS_CLI="aws --region $(get_instance_region)"

# Usage: autoscaling_group_name <EC2 instance ID>
#
#    Prints to STDOUT the name of the AutoScaling group this instance is a part of and returns 0. If
#    it is not part of any groups, then it prints nothing. On error calling autoscaling, returns
#    non-zero.
autoscaling_group_name() {
    local instance_id=$1

    # This operates under the assumption that instances are only ever part of a single ASG.
    local autoscaling_name=$($AWS_CLI autoscaling describe-auto-scaling-instances \
        --instance-ids $instance_id \
        --output text \
        --query AutoScalingInstances[0].AutoScalingGroupName)

    if [ $? != 0 ]; then
        return 1
    elif [ "$autoscaling_name" == "None" ]; then
        echo ""
    else
        echo "${autoscaling_name}"
    fi

    return 0
}

# Usage: autoscaling_enter_standby <EC2 instance ID> <ASG name>
#
#   Move <EC2 instance ID> into the Standby state in AutoScaling group <ASG name>. Doing so will
#   pull it out of any Elastic Load Balancer that might be in front of the group.
#
#   Returns 0 if the instance was successfully moved to standby. Non-zero otherwise.
autoscaling_enter_standby() {
    local instance_id=$1
    local asg_name=${2}

    msg "Checking if this instance has already been moved in the Standby state"
    local instance_state=$(get_instance_state_asg $instance_id)
    if [ $? != 0 ]; then
        msg "Unable to get this instance's lifecycle state."
        return 1
    fi

    if [ "$instance_state" == "Standby" ]; then
        msg "Instance is already in Standby; nothing to do."
        return 0
    fi

    if [ "$instance_state" == "Pending:Wait" ]; then
        msg "Instance is Pending:Wait; nothing to do."
        return 0
    fi

    msg "Checking to see if ASG ${asg_name} will let us decrease desired capacity"
    local min_desired=$($AWS_CLI autoscaling describe-auto-scaling-groups \
        --auto-scaling-group-name "${asg_name}" \
        --query 'AutoScalingGroups[0].[MinSize, DesiredCapacity]' \
        --output text)

    local min_cap=$(echo $min_desired | awk '{print $1}')
    local desired_cap=$(echo $min_desired | awk '{print $2}')

    if [ -z "$min_cap" -o -z "$desired_cap" ]; then
        msg "Unable to determine minimum and desired capacity for ASG ${asg_name}."
        msg "Attempting to put this instance into standby regardless."
    elif [ $min_cap == $desired_cap -a $min_cap -gt 0 ]; then
        local new_min=$(($min_cap - 1))
        msg "Decrementing ASG ${asg_name}'s minimum size to $new_min"
        msg $($AWS_CLI autoscaling update-auto-scaling-group \
            --auto-scaling-group-name "${asg_name}" \
            --min-size $new_min)
        if [ $? != 0 ]; then
            msg "Failed to reduce ASG ${asg_name}'s minimum size to $new_min. Cannot put this instance into Standby."
            return 1
        else
            msg "ASG ${asg_name}'s minimum size has been decremented, creating flag file /tmp/asgmindecremented"
            # Create a "flag" file to denote that the ASG min has been decremented
            touch /tmp/asgmindecremented
        fi
    fi

    msg "Putting instance $instance_id into Standby"
    $AWS_CLI autoscaling enter-standby \
        --instance-ids $instance_id \
        --auto-scaling-group-name "${asg_name}" \
        --should-decrement-desired-capacity
    if [ $? != 0 ]; then
        msg "Failed to put instance $instance_id into Standby for ASG ${asg_name}."
        return 1
    fi

    msg "Waiting for move to Standby to finish"
    wait_for_state "autoscaling" $instance_id "Standby"
    if [ $? != 0 ]; then
        local wait_timeout=$(($WAITER_INTERVAL * $WAITER_ATTEMPTS))
        msg "Instance $instance_id did not make it to standby after $wait_timeout seconds"
        return 1
    fi

    return 0
}

# Usage: autoscaling_exit_standby <EC2 instance ID> <ASG name>
#
#   Attempts to move instance <EC2 instance ID> out of Standby and into InService. Returns 0 if
#   successful.
autoscaling_exit_standby() {
    local instance_id=$1
    local asg_name=${2}

    msg "Checking if this instance has already been moved out of Standby state"
    local instance_state=$(get_instance_state_asg $instance_id)
    if [ $? != 0 ]; then
        msg "Unable to get this instance's lifecycle state."
        return 1
    fi

    if [ "$instance_state" == "InService" ]; then
        msg "Instance is already InService; nothing to do."
        return 0
    fi

    if [ "$instance_state" == "Pending:Wait" ]; then
        msg "Instance is Pending:Wait; nothing to do."
        return 0
    fi

    msg "Moving instance $instance_id out of Standby"
    $AWS_CLI autoscaling exit-standby \
        --instance-ids $instance_id \
        --auto-scaling-group-name "${asg_name}"
    if [ $? != 0 ]; then
        msg "Failed to put instance $instance_id back into InService for ASG ${asg_name}."
        return 1
    fi

    msg "Waiting for exit-standby to finish"
    wait_for_state "autoscaling" $instance_id "InService"
    if [ $? != 0 ]; then
        local wait_timeout=$(($WAITER_INTERVAL * $WAITER_ATTEMPTS))
        msg "Instance $instance_id did not make it to InService after $wait_timeout seconds"
        return 1
    fi

    if [ -a /tmp/asgmindecremented ]; then
        local min_desired=$($AWS_CLI autoscaling describe-auto-scaling-groups \
            --auto-scaling-group-name "${asg_name}" \
            --query 'AutoScalingGroups[0].[MinSize, DesiredCapacity]' \
            --output text)

        local min_cap=$(echo $min_desired | awk '{print $1}')

        local new_min=$(($min_cap + 1))
        msg "Incrementing ASG ${asg_name}'s minimum size to $new_min"
        msg $($AWS_CLI autoscaling update-auto-scaling-group \
            --auto-scaling-group-name "${asg_name}" \
            --min-size $new_min)
        if [ $? != 0 ]; then
            msg "Failed to increase ASG ${asg_name}'s minimum size to $new_min."
            return 1
        else
            msg "Successfully incremented ASG ${asg_name}'s minimum size"
            msg "Removing /tmp/asgmindecremented flag file"
            rm -f /tmp/asgmindecremented
        fi
    else
        msg "Auto scaling group was not decremented previously, not incrementing min value"
    fi

    return 0
}

# Usage: get_instance_state_asg <EC2 instance ID>
#
#    Gets the state of the given <EC2 instance ID> as known by the AutoScaling group it's a part of.
#    Health is printed to STDOUT and the function returns 0. Otherwise, no output and return is
#    non-zero.
get_instance_state_asg() {
    local instance_id=$1

    local state=$($AWS_CLI autoscaling describe-auto-scaling-instances \
        --instance-ids $instance_id \
        --query "AutoScalingInstances[?InstanceId == \`$instance_id\`].LifecycleState | [0]" \
        --output text)
    if [ $? != 0 ]; then
        return 1
    else
        echo $state
        return 0
    fi
}

reset_waiter_timeout() {
    local elb=$1
    local state_name=$2

    if [ "$state_name" == "InService" ]; then

        # Wait for a health check to succeed
        local timeout=$($AWS_CLI elb describe-load-balancers \
            --load-balancer-name $elb \
            --query 'LoadBalancerDescriptions[0].HealthCheck.Timeout')

    elif [ "$state_name" == "OutOfService" ]; then

        # If connection draining is enabled, wait for connections to drain
        local draining_values=$($AWS_CLI elb describe-load-balancer-attributes \
            --load-balancer-name $elb \
            --query 'LoadBalancerAttributes.ConnectionDraining.[Enabled,Timeout]' \
            --output text)
        local draining_enabled=$(echo $draining_values | awk '{print $1}')
        local timeout=$(echo $draining_values | awk '{print $2}')

        if [ "$draining_enabled" != "True" ]; then
            timeout=0
        fi

    else
        msg "Unknown state name, '$state_name'";
        return 1;
    fi

    # Base register/deregister action may take up to about 30 seconds
    timeout=$((timeout + 30))

    WAITER_ATTEMPTS=$((timeout / WAITER_INTERVAL))
}

# Usage: wait_for_state <service> <EC2 instance ID> <state name> [ELB name]
#
#    Waits for the state of <EC2 instance ID> to be in <state> as seen by <service>. Returns 0 if
#    it successfully made it to that state; non-zero if not. By default, checks $WAITER_ATTEMPTS
#    times, every $WAITER_INTERVAL seconds. If giving an [ELB name] to check under, these are reset
#    to that ELB's timeout values.
wait_for_state() {
    local service=$1
    local instance_id=$2
    local state_name=$3
    local elb=$4

    local instance_state_cmd
    if [ "$service" == "elb" ]; then
        instance_state_cmd="get_instance_health_elb $instance_id $elb"
        reset_waiter_timeout $elb $state_name
        if [ $? != 0 ]; then
            error_exit "Failed resetting waiter timeout for $elb"
        fi
    elif [ "$service" == "autoscaling" ]; then
        instance_state_cmd="get_instance_state_asg $instance_id"
    else
        msg "Cannot wait for instance state; unknown service type, '$service'"
        return 1
    fi

    msg "Checking $WAITER_ATTEMPTS times, every $WAITER_INTERVAL seconds, for instance $instance_id to be in state $state_name"

    local instance_state=$($instance_state_cmd)
    local count=1

    msg "Instance is currently in state: $instance_state"
    while [ "$instance_state" != "$state_name" ]; do
        if [ $count -ge $WAITER_ATTEMPTS ]; then
            local timeout=$(($WAITER_ATTEMPTS * $WAITER_INTERVAL))
            msg "Instance failed to reach state, $state_name within $timeout seconds"
            return 1
        fi

        sleep $WAITER_INTERVAL

        instance_state=$($instance_state_cmd)
        count=$(($count + 1))
        msg "Instance is currently in state: $instance_state"
    done

    return 0
}

# Usage: get_instance_health_elb <EC2 instance ID> <ELB name>
#
#    Gets the health of the given <EC2 instance ID> as known by <ELB name>. If it's a valid health
#    status (one of InService|OutOfService|Unknown), then the health is printed to STDOUT and the
#    function returns 0. Otherwise, no output and return is non-zero.
get_instance_health_elb() {
    local instance_id=$1
    local elb_name=$2

    msg "Checking status of instance '$instance_id' in load balancer '$elb_name'"

    # If describe-instance-health for this instance returns an error, then it's not part of
    # this ELB. But, if the call was successful let's still double check that the status is
    # valid.
    local instance_status=$($AWS_CLI elb describe-instance-health \
        --load-balancer-name $elb_name \
        --instances $instance_id \
        --query 'InstanceStates[].State' \
        --output text 2>/dev/null)

    if [ $? == 0 ]; then
        case "$instance_status" in
            InService|OutOfService|Unknown)
                echo -n $instance_status
                return 0
                ;;
            *)
                msg "Instance '$instance_id' not part of ELB '$elb_name'"
                return 1
        esac
    fi
}

# Usage: validate_elb <EC2 instance ID> <ELB name>
#
#    Validates that the Elastic Load Balancer with name <ELB name> exists, is describable, and
#    contains <EC2 instance ID> as one of its instances.
#
#    If any of these checks are false, the function returns non-zero.
validate_elb() {
    local instance_id=$1
    local elb_name=$2

    # Get the list of active instances for this LB.
    local elb_instances=$($AWS_CLI elb describe-load-balancers \
        --load-balancer-name $elb_name \
        --query 'LoadBalancerDescriptions[*].Instances[*].InstanceId' \
        --output text)
    if [ $? != 0 ]; then
        msg "Couldn't describe ELB instance named '$elb_name'"
        return 1
    fi

    msg "Checking health of '$instance_id' as known by ELB '$elb_name'"
    local instance_health=$(get_instance_health_elb $instance_id $elb_name)
    if [ $? != 0 ]; then
        return 1
    fi

    return 0
}

# Usage: get_elb_list <EC2 instance ID>
#
#   Finds all the ELBs that this instance is registered to. After execution, the variable
#   "ELB_LIST" will contain the list of load balancers for the given instance.
#
#   If the given instance ID isn't found registered to any ELBs, the function returns non-zero
get_elb_list() {
    local instance_id=$1

    local asg_name=$($AWS_CLI autoscaling describe-auto-scaling-instances \
        --instance-ids $instance_id \
        --query AutoScalingInstances[*].AutoScalingGroupName \
        --output text | sed -e $'s/\t/ /g')
    local elb_list=""

    if [ -z "${asg_name}" ]; then
        msg "Instance is not part of an ASG. Looking up from ELB."
        # https://github.com/awslabs/aws-codedeploy-samples/pull/41
        elb_list=$($AWS_CLI elb describe-load-balancers \
            --query 'LoadBalancerDescriptions[].[LoadBalancerName,Instances[].InstanceId]' \
            --output text | grep $instance_id | awk '{ORS=" ";print $1}')
    else
        elb_list=$($AWS_CLI autoscaling describe-auto-scaling-groups \
            --auto-scaling-group-names "${asg_name}" \
            --query AutoScalingGroups[*].LoadBalancerNames \
            --output text | sed -e $'s/\t/ /g')
    fi

    if [ -z "$elb_list" ]; then
        return 1
    else
        msg "Got load balancer list of: $elb_list"
        ELB_LIST=$elb_list
        return 0
    fi
}

# Usage: deregister_instance <EC2 instance ID> <ELB name>
#
#   Deregisters <EC2 instance ID> from <ELB name>.
deregister_instance() {
    local instance_id=$1
    local elb_name=$2

    $AWS_CLI elb deregister-instances-from-load-balancer \
        --load-balancer-name $elb_name \
        --instances $instance_id 1> /dev/null

    return $?
}

# Usage: register_instance <EC2 instance ID> <ELB name>
#
#   Registers <EC2 instance ID> to <ELB name>.
register_instance() {
    local instance_id=$1
    local elb_name=$2

    $AWS_CLI elb register-instances-with-load-balancer \
        --load-balancer-name $elb_name \
        --instances $instance_id 1> /dev/null

    return $?
}

# Usage: check_cli_version [version-to-check] [desired version]
#
#   Without any arguments, checks that the installed version of the AWS CLI is at least at version
#   $MIN_CLI_VERSION. Returns non-zero if the version is not high enough.
check_cli_version() {
    if [ -z $1 ]; then
        version=$($AWS_CLI --version 2>&1 | cut -f1 -d' ' | cut -f2 -d/)
    else
        version=$1
    fi

    if [ -z "$2" ]; then
        min_version=$MIN_CLI_VERSION
    else
        min_version=$2
    fi

    x=$(echo $version | cut -f1 -d.)
    y=$(echo $version | cut -f2 -d.)
    z=$(echo $version | cut -f3 -d.)

    min_x=$(echo $min_version | cut -f1 -d.)
    min_y=$(echo $min_version | cut -f2 -d.)
    min_z=$(echo $min_version | cut -f3 -d.)

    msg "Checking minimum required CLI version (${min_version}) against installed version ($version)"

    if [ $x -lt $min_x ]; then
        return 1
    elif [ $y -lt $min_y ]; then
        return 1
    elif [ $y -gt $min_y ]; then
        return 0
    elif [ $z -ge $min_z ]; then
        return 0
    else
        return 1
    fi
}

# Usage: msg <message>
#
#   Writes <message> to STDERR only if $DEBUG is true, otherwise has no effect.
msg() {
    local message=$1
    $DEBUG && echo $message 1>&2
}

# Usage: error_exit <message>
#
#   Writes <message> to STDERR as a "fatal" and immediately exits the currently running script.
error_exit() {
    local message=$1

    echo "[FATAL] $message" 1>&2
    exit 1
}

# Usage: get_instance_id
#
#   Writes to STDOUT the EC2 instance ID for the local instance. Returns non-zero if the local
#   instance metadata URL is inaccessible.
get_instance_id() {
    curl -s http://169.254.169.254/latest/meta-data/instance-id
    return $?
}
