# Stops and disables New Relic system services.
# Run this recipe on an existing NewRelic-monitored instance to turn it into an 'unmonitored' instance.
include_recipe 'cdo-newrelic'

# Use ruby_block to apply after all other notifications.
ruby_block 'stop newrelic services' do
  block {}
  %w(cdo-newrelic newrelic-sysmond).each do |service|
    %i(stop disable).each do |action|
      notifies action, "service[#{service}]"
    end
  end
end
