require 'optparse'

# This script was originally run to fix the authentication options for users
# whose LTI integration was deleted and replaced with a new one in Canvas.
# When this happens, the old LTI integration's client ID is no longer valid,
# meaning we can no longer log in users or sync rosters associated with the
# old integration.
#
# This script finds users with authentication options tied to the old integration
# and either creates a new authentication option tied to the new integration OR
# moves an existing new authentication option to point to the same user as the old one.
#
# Logs to the CDO production-syslog log group.
#
# Usage:
#   bundle exec ruby bin/oneoff/platform/fix_auth_for_deleted_lti_integration.rb \
#     --old-client-id <id> \
#     --new-client-id <id> \
#     --old-integration-id <id> \
#     --new-integration-id <id>
#

options = {
  old_client_id: nil,
  new_client_id: nil,
  old_integration_id: nil,
  new_integration_id: nil
}

OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage: bundle exec ruby bin/oneoff/platform/fix_auth_for_deleted_lti_integration.rb \\
      --old-client-id <id> \\
      --new-client-id <id> \\
      --old-integration-id <id> \\
      --new-integration-id <id>
  BANNER

  opts.on('--old-client-id ID', 'Client ID associated with the deleted LTI integration') do |value|
    options[:old_client_id] = value
  end

  opts.on('--new-client-id ID', 'Client ID associated with the replacement LTI integration') do |value|
    options[:new_client_id] = value
  end

  opts.on('--old-integration-id ID', Integer, 'Database id of the deleted LTI integration') do |value|
    options[:old_integration_id] = value
  end

  opts.on('--new-integration-id ID', Integer, 'Database id of the replacement LTI integration') do |value|
    options[:new_integration_id] = value
  end
end.parse!

required_keys = %i[old_client_id new_client_id old_integration_id new_integration_id]
missing = required_keys.select {|key| options[key].nil?}
unless missing.empty?
  raise OptionParser::MissingArgument, "Missing required options: #{missing.join(', ')}"
end

old_client_id = options[:old_client_id]
new_client_id = options[:new_client_id]
old_integration_id = options[:old_integration_id]
new_integration_id = options[:new_integration_id]

old_auth_options = AuthenticationOption
  .where("authentication_id LIKE ?","https://canvas.instructure.com|#{old_client_id}%")
  .where(credential_type: "lti_v1")

total_size = old_auth_options.size
CDO.log.info "Found #{total_size} old authentication options to rewire"

num_processed = 0
skip_count = 0
rewire_count = 0
create_new_count = 0
opted_out_count = 0

old_auth_options.find_each do |old_auth_option|
  old_user = old_auth_option.user
  auth_option_from_new_integration = AuthenticationOption.find_by(
    authentication_id: old_auth_option.authentication_id.sub(old_client_id, new_client_id),
    credential_type: "lti_v1"
  )
  
  # If both auth options are attached to the same user, we don't need to do anything.
  if auth_option_from_new_integration.present? && auth_option_from_new_integration.user_id == old_user.id
    CDO.log.info "Skipping rewiring of auth option #{old_auth_option.id} because both auth options are already attached to the same user #{old_user.id}"
    skip_count += 1
    next
  end
  
  ActiveRecord::Base.transaction do
    # If the new auth option already exists and is attached to a different user, we rewire it to point to the old user
    if auth_option_from_new_integration.present?
      lti_user_identity_from_new_integration = auth_option_from_new_integration.user.lti_user_identities&.find_by(lti_integration_id: new_integration_id)
      CDO.log.info "Rewiring auth option #{auth_option_from_new_integration.id} and lti_user_identity #{lti_user_identity_from_new_integration&.id} from user #{auth_option_from_new_integration.user_id} to user #{old_user.id}"
      old_user.lti_user_identities << lti_user_identity_from_new_integration if lti_user_identity_from_new_integration.present?
      old_user.authentication_options << auth_option_from_new_integration
      rewire_count += 1
    else
      # If the new auth option doesn't exist, we need to create it and attach it to the old user
      CDO.log.info "Creating new auth option and lti_user_identity for user #{old_user.id} based on old auth option #{old_auth_option.id}"
      fresh_ao = AuthenticationOption.new(
        authentication_id: old_auth_option.authentication_id.sub(old_client_id, new_client_id),
        credential_type: 'lti_v1',
        email: old_auth_option.email,
        hashed_email: old_auth_option.hashed_email,
      )
      # Also create the new LtiUserIdentity
      subject = old_auth_option.authentication_id.split('|').last
      fresh_lti_user_identity = LtiUserIdentity.new(
        lti_integration_id: new_integration_id,
        subject: subject,
      )
      old_user.lti_user_identities << fresh_lti_user_identity
      old_user.authentication_options << fresh_ao
      create_new_count += 1
    end

    # Ensure the old user has lms_landing_opted_out set to true
    unless old_user.lms_landing_opted_out
      old_user.lms_landing_opted_out = true
      old_user.save!
      opted_out_count += 1
    end
  end
  num_processed += 1
end

CDO.log.info "Processed #{num_processed}/#{total_size} old authentication options"
CDO.log.info "Skipped rewiring for #{skip_count} old authentication options"
CDO.log.info "Rewired #{rewire_count} old authentication options"
CDO.log.info "Created new auth options for #{create_new_count} old authentication options"
CDO.log.info "Set lms_landing_opted_out to true for #{opted_out_count} users"
