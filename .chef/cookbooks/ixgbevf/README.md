# ixgbevf-cookbook

This cookbook will use dkms to install an updated version of the ixgbevf kernel module.
Most linux distributions are still distributing version 2.12 with their kernels. For AWS
the minimum recommended version is 2.14.2. Having this version is necessary to ensure that
"Enhanced Networking" can be activated on the instance types that support it (C3/4, D2, I2, 
M4, R3)

This driver may also be useful for other virtualized environments

For more info on the application to EC2 instance types, see: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html

Additionally this cookbook will be disable by default [Predictable Network Interface Names](http://www.freedesktop.org/wiki/Software/systemd/PredictableNetworkInterfaceNames/).

Prior works this is based on:
https://gist.github.com/CBarraford/8850424
https://gist.github.com/vdm/6af55e1a568de0b61882
https://github.com/jhohertz/buri/blob/develop/playbooks/roles/base_buri/tasks/update-ixgbevf.yml

## Supported Platforms

Tested on:

* Centos 6.7, 7.1
* Ubuntu 14.04
* Debian 8.1

## Attributes

<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['version']</tt></td>
    <td>String</td>
    <td>Version of exgbevf to install</td>
    <td><tt>2.16.1</tt></td>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['package']</tt></td>
    <td>String</td>
    <td>Package file name</td>
    <td><tt>ixgbevf-2.16.1.tar.gz</tt></td>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['package_url']</tt></td>
    <td>String</td>
    <td>URL for package file download. (Yes, there is a space in the upstream URL)</td>
    <td><tt>http://sourceforge.net/projects/e1000/files/ixgbevf stable/2.16.1/ixgbevf-2.16.1.tar.gz</tt></td>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['dir']</tt></td>
    <td>String</td>
    <td>Directory for the driver sources. (Changing this a bad idea, will confuse DKMS)</td>
    <td><tt>/usr/src/ixgbevf-2.16.1</tt></td>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['module_flags']</tt></td>
    <td>String</td>
    <td>Parameters for the kernel module</td>
    <td><tt>InterruptThrottleRate=1,1,1,1,1,1,1,1</tt></td>
  </tr>
  <tr>
    <td><tt>['ixgbevf']['disable_ifnames']</tt></td>
    <td>String</td>
    <td>If true, will disable predictable network interface names on platforms it is enabled.</td>
    <td><tt>true</tt></td>
  </tr>
  </table>

## Usage

This recipe is intented to be incorporated into a base cookbook or as a part of your build's run list.

It is recommended to invoke this cookbook PRIOR to running package updates, so that is is applied to a currently running kernel. Afterwards, run the upgrades, and DKMS should ensure the driver carries over to the new kernel.

### ixgbevf::default

Include `ixgbevf` in your node's `run_list`:

```json
{
  "run_list": [
    "recipe[ixgbevf::default]"
  ]
}
```

## License and Authors

Author:: Joe Hohertz (<jhohertz@gmail.com>)
