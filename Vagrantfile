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
  config.vm.provision "chef_apply", recipe: <<-RECIPE1
    execute 'update-and-upgrade-packages' do
      command 'aptitude update && aptitude upgrade -y'
      retries 5
      retry_delay 5
    end

    package ["git", "mysql-server", "mysql-client", "libmysqlclient-dev", "libxslt1-dev", "libssl-dev", "zlib1g-dev", "imagemagick", "libmagickcore-dev", "libmagickwand-dev", "openjdk-7-jre-headless", "libcairo2-dev", "libjpeg8-dev", "libpango1.0-dev", "libgif-dev", "curl", "pdftk", "ruby2.0", "ruby2.0-dev"] do
      action :install
      retries 5
      retry_delay 5
    end

    link "/usr/bin/ruby" do
      to "/usr/bin/ruby2.0"
    end

    link "/usr/bin/gem" do
      to "/usr/bin/gem2.0"
    end

    execute 'chown-gem-directories' do
      command 'chown vagrant /usr/bin/gem; chown -R vagrant /usr/local/bin; [ ! -d /var/lib/gems ] && mkdir /var/lib/gems; chown -R vagrant /var/lib/gems'
    end

    execute 'download-and-install-node' do
      command 'curl -sSL https://deb.nodesource.com/setup | bash - && aptitude install -y nodejs'
      retries 5
      retry_delay 5
    end

    gem_package "bundler" do
      action :upgrade
      version '1.10.4'
      options "--no-user-install"
      retries 5
      retry_delay 5
    end

    git "/home/vagrant/code-dot-org" do
      repository "https://github.com/code-dot-org/code-dot-org.git"
      action :sync
      user 'vagrant'
      group 'vagrant'
      timeout 12000
      retries 5
      retry_delay 5
      notifies :run, "execute[bundle-install]", :immediately
    end

    execute 'bundle-install' do
      command 'HOME=/home/vagrant/ bundle install'
      cwd '/home/vagrant/code-dot-org/aws'
      retries 5
      retry_delay 5
      user 'vagrant'
      group 'vagrant'
      action :nothing
    end
  RECIPE1

  config.vm.provision "shell", privileged: false, inline: <<-SHELL1
    cd code-dot-org
    sudo chown vagrant /home/vagrant/.npm
    rake install
  SHELL1

  config.vm.provision "shell", run: "always", privileged: false, inline: <<-SHELL2
    cd code-dot-org
    git fetch
    rake build:dashboard
    rake build:pegasus
  SHELL2
end
