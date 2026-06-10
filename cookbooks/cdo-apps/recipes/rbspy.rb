# Install https://rbspy.github.io/ to allow manual debugging of ruby performance issues.

ark 'rbspy' do
  url "https://github.com/rbspy/rbspy/releases/download/v0.48.0/#{name}-x86_64-unknown-linux-musl.tar.gz"
  checksum 'f349a45204dd99970990bf2c68e0d438d22e713e2e07e757f8d612f88af97ee1'
  strip_components 0
  has_binaries ['rbspy']
end

link '/usr/local/bin/rbspy' do
  to '/usr/local/rbspy-1/rbspy-x86_64-unknown-linux-musl'
end
