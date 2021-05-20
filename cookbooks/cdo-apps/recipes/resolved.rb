# Use patched version of script to fix issue which causes intermittent DNS resolution failures:
# https://bugs.launchpad.net/ubuntu/+source/systemd/+bug/1805183
# Specific patch used: https://bugs.launchpad.net/ubuntu/+source/systemd/+bug/1805183/comments/9

cookbook_file '/etc/dhcp/dhclient-enter-hooks.d/resolved' do
  source 'resolved'
  owner 'root'
  group 'root'
  mode '0755'
end
