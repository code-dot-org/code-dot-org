#
# Cookbook Name:: cdo-apps
# Recipe:: remove_python
#
# Historically the cdo-python cookbook was included by cdo-apps on every app
# server, installing uv to /usr/local/bin, and `rake build` ran `uv sync`,
# which downloaded a uv-managed CPython and created a project venv in the
# repository root -- all to support the now-retired server-side python.
#
# Server-side python is gone. uv is now installed only on daemon instances
# (cdo-apps::default includes cdo-python when node['cdo-apps']['daemon']). The
# managed test server -- a daemon -- runs the Python Lab unit tests via
# `uv run pytest`, which manages its own venv. Daemons therefore keep uv, the
# project venv, and the uv caches untouched.
#
# This recipe cleans up frontend web servers only: they never run Python and no
# longer install uv, so strip the orphaned uv binary, its per-user caches, and
# any stale project venv left by the retired all-server cdo-python include or
# the old server-side `uv sync`. All resources are no-ops on hosts already
# clean.
#
# TODO infra: remove this recipe once all frontend servers have converged.

# Daemons (incl. the managed test server) legitimately use uv; leave them be.
return if node['cdo-apps']['daemon']

user = node[:user]
home = node[:home]
root = File.join home, node.chef_environment

%w(/usr/local/bin/uv /usr/local/bin/uvx).each do |bin|
  file bin do
    action :delete
  end
end

[
  File.join(root, '.venv'),
  "/home/#{user}/.local/share/uv",
  "/home/#{user}/.cache/uv",
].each do |dir|
  directory dir do
    action :delete
    recursive true
  end
end
