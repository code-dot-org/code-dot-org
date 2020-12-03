# Recursively resolve CNAME entries to get the last-resolved domain.
def get_cname(domain)
  require 'resolv'
  Resolv::DNS.open do |dns|
    loop do
      domain = dns.getresource(domain, Resolv::DNS::Resource::IN::CNAME)&.name.to_s
    end
  end
rescue Resolv::ResolvError
  domain
end
