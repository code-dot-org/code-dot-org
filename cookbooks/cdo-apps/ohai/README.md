# sudo-user

This cookbook supports the pattern where `chef-client` is invoked via `sudo` for root-level access privileges, but where
the underlying user is needed for certain operations.

- Provides `node[:user]` via `ENV['SUDO_USER']` when Ohai is run via `sudo`, falling back to `ENV['USER']` otherwise.
- Overwrites `node[:current_user]` to preserve the Chef 11 behavior where this value was provided by `Etc.getlogin`.
(`SUDO_USER` is more reliable than `Etc.getlogin` because the system may not have set the `loginuid` for the underlying
user (e.g., when running chef-client via `Docker exec` without `ssh`).
- Sets `node[:home]` to the user's home folder.
