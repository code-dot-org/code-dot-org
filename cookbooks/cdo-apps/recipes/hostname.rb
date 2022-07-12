# Set hostname to the Chef node name via chef hostname resource.
#
# See https://docs.chef.io/resources/hostname/

HOSTNAME_INVALID_CHAR = /[^[:alnum:]-]/

hostname 'set to Chef node name' do
  hostname node.name.downcase.gsub(HOSTNAME_INVALID_CHAR, '-')
end
