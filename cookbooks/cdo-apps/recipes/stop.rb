# Stops and disables all system services.

# Use ruby_block to apply after all other notifications.
ruby_block 'stop services' do
  block {}
  %w(
    pegasus
    dashboard
    varnish
    nginx
  ).each do |service|
    %i(stop disable).each do |action|
      notifies action, "service[#{service}]"
    end
  end
end
