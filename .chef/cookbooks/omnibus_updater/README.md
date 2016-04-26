OmnibusUpdater
==============

Update your omnibus! This cookbook can install the omnibus
Chef package into your system if you are currently running
via gem install, and it can keep your omnibus install up
to date.

Supports
========

- redhat
- centos
- amazon
- scientific
- oracle
- debian
- ubuntu
- mac_os_x
- solaris

Usage
=====

Add the recipe to your run list and specify what version should
be installed on the node:

`knife node run_list add recipe[omnibus_updater]`

In your role you'll likely want to set the version. It defaults
to nothing, and will install the latest..

```
override_attributes(
  :omnibus_updater => {
    :version => '11.4.0'
  }
)
```

It can also uninstall Chef from the system Ruby installation
if you tell it to:

```
override_attributes(
  :omnibus_updater => {
    :remove_chef_system_gem => true
  }
)
```

Features
========

Latest Version
--------------

Force installation of the latest version regardless of value stored in version
attribute by setting the `force_latest` attribute.

Restarting Chef Client
------------

By default, the Chef Client run will be terminated (killed) when an upgrade is performed.
This behavior can be disabled by setting `:kill_chef_on_upgrade` to false.

Two kill modes are supported by the `upgrade_behavior` attribute:

* If set to `'kill'` (default for interval-based chef-client runs), the run will be aborted.
  When using this behavior, it is recommended to set `:restart_chef_service` to true if the
  long-running Chef process is managed as an OS service.
* If set to `'exec'` (default for non-interval runs), the run will be restarted by
  re-`exec`ing chef-client directly within the current process.
  This allows the run to complete seamlessly without errors being bubbled up the stack.
  You can customize the command that is exec'd by setting the `exec_command` attribute.
  The default for `exec_command` is `$0` (the original command used to call chef-client).
* If set to anything else, an error is raised.

Restart chef-client Service
---------------------------

Use the `restart_chef_service` attribute to restart chef-client if you have it running as a service.

Prerelease
--------

Prereleases can be installed via the auto-installation using `prerelease` attribute.

Disable
-------

If you want to disable the updater you can set the `disabled`
attribute to true. This might be useful if the cookbook is added
to a role but should then be skipped for example on a Chef server.

Prevent Downgrade
-----------------

If you want to prevent the updater from downgrading chef on a node, you
can set the `prevent_downgrade` attribute to true.  This can be useful
for testing new versions manually.  Note that the `always_download`
attribute takes precedence if set.

Infos
=====

* Repo: https://github.com/hw-cookbooks/omnibus_updater
* IRC: Freenode @ #heavywater
* Cookbook: http://ckbk.it/omnibus_updater
