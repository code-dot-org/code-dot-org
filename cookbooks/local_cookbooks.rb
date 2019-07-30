# Sets path to locally-provided cookbooks for all metadata-provided dependencies.
# Add `depends [cookbook]` entries to `metadata.rb` and add the following line to `Berksfile`:
# instance_eval File.read('../local_cookbooks.rb'), __FILE__
Ridley::Chef::Cookbook::Metadata.from_file('metadata.rb').dependencies.keys.each do |cookbook|
  path = "../#{cookbook}"
  next unless File.directory? path
  cookbook cookbook, path: path
end

# Pin specific dependency versions:
cookbook 'seven_zip', '< 3.0.0' # 3.0.0 requires Chef 13
cookbook 'apt', '< 6.0.0' # 6.0.0 requires Chef >= 12.9
cookbook 'ark', '< 4.0.0' # 4.0.0 requires Chef >= 13.4
