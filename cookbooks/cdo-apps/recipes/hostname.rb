# Set hostname to the Chef node name (via chef_hostname cookbook)
HOSTNAME_INVALID_CHAR = /[^[:alnum:]-]/
hostname node.name.downcase.gsub(HOSTNAME_INVALID_CHAR, '-')
