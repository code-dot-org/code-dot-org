tar_extract 'https://github.com/rbspy/rbspy/releases/download/v0.3.8/rbspy-v0.3.8-x86_64-unknown-linux-musl.tar.gz' do
  target_dir '/usr/local/bin'
  creates '/usr/local/bin/rbspy'
end
