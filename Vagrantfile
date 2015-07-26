# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    # vb.gui = true

    # Customize the amount of memory on the VM:
    vb.memory = "2048"
  end

  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", privileged: false, inline: <<-SHELL1
    sudo aptitude update
    sudo aptitude upgrade
    DEBIAN_FRONTEND=noninteractive sudo -E aptitude install -q -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-7-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk ruby2.0 ruby2.0-dev
    sudo ln -sf /usr/bin/ruby2.0 /usr/bin/ruby
    sudo ln -sf /usr/bin/gem2.0 /usr/bin/gem
    sudo chown $(whoami) /usr/bin/gem/
    curl -sL https://deb.nodesource.com/setup | sudo bash -
    sudo aptitude install -y nodejs
    git clone https://github.com/code-dot-org/code-dot-org.git

    [ ! -d /var/lib/gems ] && sudo mkdir /var/lib/gems
    sudo chown $(whoami) /var/lib/gems
    sudo chown $(whoami) /usr/local/bin
    gem install bundler -v 1.10.4
    cd code-dot-org/aws
    bundle install
    cd ..
    sudo chown $(whoami) $HOME/.npm
    rake install
  SHELL1

  config.vm.provision "shell", run: "always", privileged: false, inline: <<-SHELL2
    cd code-dot-org
    git fetch
    rake build:dashboard
    rake build:pegasus
  SHELL2
end
