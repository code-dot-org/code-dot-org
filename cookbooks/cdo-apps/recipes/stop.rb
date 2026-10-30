# Stops and disables all system services.

# Use ruby_block to apply after all other notifications.
ruby_block 'stop services' do
  block {}

  services = %w(dashboard nginx)
  actions = %i(stop disable)

  services.each do |service|
    actions.each do |action|
      notifies action, "service[#{service}]"
    end
  end
end
