# Stops all associated OS services.
ruby_block 'stop services' do
  block {}
  %w(dashboard pegasus varnish nginx mysql postfix).each do |service|
    notifies :stop, "service[#{service}]"
  end
end
