# See http://docs.getchef.com/config_rb_knife.html for more information on knife configuration options

current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                @node_name = ENV['CDO_CHEF_NODE_NAME'] || 'cdo-ci'
                         @org_name = ENV['CDO_CHEF_ORG_NAME'] || 'code-dot-org'
client_key               @client_key = ENV['CDO_CHEF_CLIENT_KEY'] || "#{ENV['HOME']}/.chef/#{@node_name}.pem"
validation_client_name   @validation_client_name = ENV['CDO_CHEF_VALIDATION_CLIENT_NAME'] || "#{@org_name}-validator"
validation_key           @validation_key = ENV['CDO_CHEF_VALIDATION_KEY'] || "#{ENV['HOME']}/.chef/#{@validation_client_name}.pem"
chef_server_url          @chef_server_url = ENV['CDO_CHEF_SERVER_URL'] || "https://code-org.saas.chef.io/organizations/#{@org_name}"
cache_type               'BasicFile'
cache_options( :path => "#{ENV['HOME']}/.chef/checksums" )
cookbook_path            ["#{current_dir}/../cookbooks"]
