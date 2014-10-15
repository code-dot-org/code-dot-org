1. In `/Rakefile` under `task :webserver => WebserverDependencies`, add your packages to the line `RakeUtils.sudo 'aptitude', 'install', '-y'`
1. Test on an Ubuntu machine: `rake install:webserver`
1. Push to staging
1. Once your changes hit staging:
  * `ssh staging.code.org`
  * `cd staging`
  * `rake install:webserver`
1. Once your changes hit test: `ssh test.code.org 'cd test; rake install:webserver'`
1. If your changes apply to production, do the same with the production servers.
