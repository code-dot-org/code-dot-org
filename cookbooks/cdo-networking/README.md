# cdo-networking

Wraps the [ixgbevf](https://github.com/PaytmLabs/chef-ixgbevf) cookbook supporting [Enhanced Networking](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html) on Ubuntu EC2 instances
by updating the "Intel 10 Gigabit Virtual Function" (`ixgbevf`) Network Driver kernel module to the latest version.

AWS [recommends](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html#enhanced-networking-ubuntu)
that the `ixgbevf` module be version `2.14.2` or higher for the best performance.
