require 'spec_helper'

describe "ixgbevf" do
  it "should upgrade ixgbevf kernel module" do
    output = `modinfo ixgbevf` 
    expect(output).to match(/version: +3\.1\.2/)
  end

end

if (os[:family] == 'debian' && os[:release].to_f >= 8.0) || (os[:family] == 'ubuntu' && os[:release].to_f >= 14.04)
  describe file('/boot/grub/grub.cfg') do
    its(:content) { should contain 'net.ifnames=0' }
  end
end

if ( os[:family] == ('redhat' || 'centos') ) && os[:release].to_f >= 7.0
  describe file('/boot/grub2/grub.cfg') do
    its(:content) { should contain 'net.ifnames=0' }
  end
end




