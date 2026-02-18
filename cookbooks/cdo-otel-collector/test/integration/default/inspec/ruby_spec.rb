require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end

def file_exist(file)
  describe file(file) do
    it {should exist}
  end
end

def service_running(service)
  describe service(service) do
    it {should be_running}
    it {should be_enabled}
  end
end

def port_listening(port)
  describe port(port) do
    it {should be_listening}
  end
end

# Ensure proper version of collector is installed
cmd '/usr/local/bin/otelcol --version', 'otelcol version 0.95.0'

# Check that configuration files exist
file_exist '/etc/otelcol/config.yaml'
file_exist '/lib/systemd/system/otel-collector.service'
file_exist '/usr/local/bin/otelcol'

# Check that service is running
service_running 'otel-collector'

# Check that collector is listening on expected ports
port_listening 4317  # OTLP gRPC
port_listening 4318  # OTLP HTTP
port_listening 8888  # Internal metrics
