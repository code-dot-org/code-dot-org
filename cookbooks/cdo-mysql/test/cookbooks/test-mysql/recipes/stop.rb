# Stops mysql OS service.
ruby_block 'stop mysql' do
  block {}
  notifies :stop, 'service[mysql]'
end
