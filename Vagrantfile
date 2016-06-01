# UI Object for console interactions.
@ui = Vagrant::UI::Colored.new

# Install required plugins if not present.
required_plugins = ["vagrant-triggers", "vagrant-gatling-rsync"]
required_plugins.each do |plugin|
  need_restart = false
  unless Vagrant.has_plugin? plugin
    system "vagrant plugin install #{plugin}"
    need_restart = true
  end
  exec "vagrant #{ARGV.join(' ')}" if need_restart
end

# Determine if we are on Windows host or not.
is_windows = Vagrant::Util::Platform.windows?

# Determine paths.
vagrant_root = File.dirname(__FILE__)  # Vagrantfile location
if is_windows
  vagrant_mount_point = `cygpath #{vagrant_root}`.strip! # Remove trailing \n
  vagrant_mount_point = vagrant_mount_point.gsub(/\/cygdrive/, '')  # Remove '/cygdrive' prefix
else
  vagrant_mount_point = vagrant_root
end

vagrant_folder_name = File.basename(vagrant_root)  # Folder name only. Used as the SMB share name.

# Use vagrant.yml for local VM configuration overrides.
require 'yaml'
if !File.exist?(vagrant_root + '/vagrant.yml')
  @ui.error 'Configuration file not found! Please copy vagrant.yml.dist to vagrant.yml and try again.'
  exit
end
$vconfig = YAML::load_file(vagrant_root + '/vagrant.yml')

if is_windows
  require 'win32ole'
  # Determine if Vagrant was launched from the elevated command prompt.
  running_as_admin = ((`reg query HKU\\S-1-5-19 2>&1` =~ /ERROR/).nil? && is_windows)
  
  # Run command in an elevated shell.
  def windows_elevated_shell(args)
    command = 'cmd.exe'
    args = "/C #{args} || timeout 10"
    shell = WIN32OLE.new('Shell.Application')
    shell.ShellExecute(command, args, nil, 'runas')
  end

  # Method to create the user and SMB network share on Windows.
  def windows_net_share(share_name, path)
    # Add the vagrant user if it does not exist.
    smb_username = $vconfig['synced_folders']['smb_username']
    smb_password = $vconfig['synced_folders']['smb_password']
    
    command_user = "net user #{smb_username} || ( net user #{smb_username} #{smb_password} /add && WMIC USERACCOUNT WHERE \"Name='vagrant'\" SET PasswordExpires=FALSE )"
    @ui.info "Adding vagrant user"
    windows_elevated_shell command_user

    # Add the SMB share if it does not exist.
    command_share = "net share #{share_name} || net share #{share_name}=#{path} /grant:#{smb_username},FULL"
    @ui.info "Adding vagrant SMB share"
    windows_elevated_shell command_share

    # Set folder permissions.
    command_permissions = "icacls #{path} /grant #{smb_username}:(OI)(CI)M"
    @ui.info "Setting folder permissions"
    windows_elevated_shell command_permissions
  end

  # Method to remove the user and SMB network share on Windows.
  def windows_net_share_remove(share_name)
    smb_username = $vconfig['synced_folders']['smb_username']

    command_user = "net user #{smb_username} /delete || echo 'User #{smb_username} does not exist' && timeout 10"
    windows_elevated_shell command_user

    command_share = "net share #{share_name} /delete || echo 'Share #{share_name} does not exist' && timeout 10"
    windows_elevated_shell command_share
  end
else
  # Determine if Vagrant was launched with sudo (as root).
  running_as_root = (Process.uid == 0)
end

# Vagrant should NOT be run as root/admin.
if running_as_root
# || running_as_admin
  @ui.error "Vagrant should be run as a regular user to avoid issues."
  exit
end

######################################################################

# Vagrant Box Configuration #
Vagrant.require_version ">= 1.7.3"

Vagrant.configure("2") do |config|
  config.vm.define "boot2docker"

  config.vm.box = "blinkreaction/boot2docker"
  config.vm.box_version = "1.10.3"
  config.vm.box_check_update = true

  ## Network ##

  box_ip = $vconfig['ip']['primary']  # e.g. 192.168.10.10
  host_ip = box_ip.gsub(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/, '\1.\2.\3.1')  # e.g. 192.168.10.1

  # Primary private network IP (default: 192.168.10.10)
  # Using Intel PRO/1000 MT Desktop [82540EM] network adapter - shows slightly better performance compared to "virtio".
  config.vm.network "private_network", ip: box_ip, nic_type: "82540EM"
  # Addtional IP addresses (see vagrant.yml)
  $vconfig['ip']['additional'].each do |private_ip|
    config.vm.network "private_network", ip: private_ip, nic_type: "82540EM"
  end unless $vconfig['ip']['additional'].nil?

 ####################################################################
 ## Synced folders configuration ##

  synced_folders = $vconfig['synced_folders']
  # nfs: Better performance on Mac
  if synced_folders['type'] == "nfs"  && !is_windows
    @ui.success "Using nfs synced folder option"
    config.vm.synced_folder vagrant_root, vagrant_mount_point,
      type: "nfs",
      mount_options: ["nolock", "vers=3", "tcp"]
    config.nfs.map_uid = Process.uid
    config.nfs.map_gid = Process.gid
  # nfs2: Optimized NFS settings for even better performance on Mac, experimental
  elsif ( synced_folders['type'] == "nfs2" || synced_folders['type'] == "default" )  && !is_windows
    @ui.success "Using nfs2 synced folder option"
    config.vm.synced_folder vagrant_root, vagrant_mount_point,
      type: "nfs",
      mount_options: ["nolock", "noacl", "nocto", "noatime", "nodiratime", "vers=3", "tcp", "actimeo=2"]
    config.nfs.map_uid = Process.uid
    config.nfs.map_gid = Process.gid
  # smb: Better performance on Windows. Requires Vagrant to be run with admin privileges.
  elsif synced_folders['type'] == "smb" && is_windows
    @ui.success "Using smb synced folder option"
    config.vm.synced_folder vagrant_root, vagrant_mount_point,
      type: "smb",
      smb_username: synced_folders['smb_username'],
      smb_password: synced_folders['smb_password']
  # smb2: Better performance on Windows. Does not require running vagrant as admin.
  elsif ( synced_folders['type'] == "smb2" || synced_folders['type'] == "default" ) && is_windows
    @ui.success "Using smb2 synced folder option"

    if $vconfig['synced_folders']['smb2_auto']
      # Create the share before 'up'.
      config.trigger.before :up, :stdout => true, :force => true do
        info 'Setting up SMB user and share'
        windows_net_share vagrant_folder_name, vagrant_root
      end

      # Remove the share after 'halt'.
      config.trigger.after :destroy, :stdout => true, :force => true do
        info 'Removing SMB user and share'
        windows_net_share_remove vagrant_folder_name
      end
    end

    # Mount the share in boot2docker.
    config.vm.provision "shell", run: "always" do |s|
      s.inline = <<-SCRIPT
        mkdir -p vagrant $2
        mount -t cifs -o uid=`id -u docker`,gid=`id -g docker`,noperm,sec=ntlm,username=$3,pass=$4,dir_mode=0777,file_mode=0777 //$5/$1 $2
      SCRIPT
      s.args = "#{vagrant_folder_name} #{vagrant_mount_point} #{$vconfig['synced_folders']['smb_username']} #{$vconfig['synced_folders']['smb_password']} #{host_ip}"
    end
  # rsync: the best performance, cross-platform platform, one-way only.
  elsif synced_folders['type'] == "rsync"
    @ui.success "Using rsync synced folder option"

    # Construct and array for rsync_exclude
    rsync_exclude = []
    unless synced_folders['rsync_exclude'].nil?
      for item in synced_folders['rsync_exclude'] do
        rsync_exclude.push(item)
      end
    end

    # Only sync explicitly listed folders.
    if synced_folders['rsync_folders'].nil?
      @ui.error "ERROR: 'folders' list cannot be empty when using 'rsync' sync type. Please check your vagrant.yml file."
      exit
    else
      for synced_folder in synced_folders['rsync_folders'] do
        config.vm.synced_folder "#{vagrant_root}/#{synced_folder}", "#{vagrant_mount_point}/#{synced_folder}",
          type: "rsync",
          rsync__exclude: rsync_exclude,
          #rsync__args: ["--archive", "--delete", "--compress", "--whole-file"]
          rsync__args: ["--archive", "--compress", "--whole-file"]
      end
    end
    # Configure vagrant-gatling-rsync
    config.gatling.rsync_on_startup = false
    config.gatling.latency = synced_folders['rsync_latency']
    config.gatling.time_format = "%H:%M:%S"

    # Launch gatling-rsync-auto in the background
    if synced_folders['rsync_auto'] && !is_windows
      [:up, :reload, :resume].each do |trigger|
        config.trigger.after trigger do
          success "Starting background rsync-auto process..."
          info "Run 'tail -f #{vagrant_root}/rsync.log' to see rsync-auto logs."
          # Kill the old sync process
          `kill $(pgrep -f rsync-auto) > /dev/null 2>&1 || true`
          # Start a new sync process in background
          `vagrant gatling-rsync-auto >> rsync.log &`
        end
      end
      [:halt, :suspend, :destroy].each do |trigger|
        config.trigger.before trigger do
          # Kill rsync-auto process
          success "Stopping background rsync-auto process..."
          `kill $(pgrep -f rsync-auto) > /dev/null 2>&1 || true`
          `rm -f rsync.log`
        end
      end
    end
  # vboxsf: reliable, cross-platform and terribly slow performance
  elsif synced_folders['type'] == "vboxsf"
    @ui.warn "WARNING: Using the SLOWEST folder sync option (vboxsf)"
    config.vm.synced_folder vagrant_root, vagrant_mount_point
  # Warn if neither synced_folder not individual_mounts is enabled
  elsif synced_folders['individual_mounts'].nil?
    @ui.error "ERROR: Synced folders not enabled or misconfigured. The VM will not have access to files on the host."
  end

  # Individual mounts
  unless synced_folders['individual_mounts'].nil?
    @ui.success "Using individual_mounts synced folder option"
    for synced_folder in synced_folders['individual_mounts'] do
      if synced_folder['type'] == 'vboxsf'
        config.vm.synced_folder synced_folder['location'], synced_folder['mount'],
          mount_options: [synced_folder['options']]
      elsif synced_folder['type'] == 'nfs'
        config.vm.synced_folder synced_folder['location'], synced_folder['mount'],
          type: "nfs",
          mount_options: [synced_folder['options']]
      end
    end
  end

  # Make host home directory available to containers in /.home
  if File.directory?(File.expand_path("~"))
    config.vm.synced_folder "~", "/.home"
  end

  # Make host SSH keys available to containers in /.ssh (legacy, TO BE REMOVED soon)
  if File.directory?(File.expand_path("~/.ssh"))
    config.vm.synced_folder "~/.ssh", "/.ssh"
  end

  ######################################################################

  ## VirtualBox VM settings.
  
  config.vm.provider "virtualbox" do |v|
    v.gui = $vconfig['v.gui']  # Set to true for debugging. Will unhide VM's primary console screen.
    v.name = vagrant_folder_name + "_boot2docker"  # VirtualBox VM name.
    v.cpus = $vconfig['v.cpus']  # CPU settings. VirtualBox works much better with a single CPU.
    v.memory = $vconfig['v.memory']  # Memory settings.
    
    # Use VirtualBox DNS proxy mode (but not the resolver mode).
    # See https://www.virtualbox.org/manual/ch09.html#nat-adv-dns
    # and https://www.virtualbox.org/manual/ch09.html#nat_host_resolver_proxy
    # Also see https://github.com/docker/machine/pull/1069 for a different perspective on this.
    v.customize ['modifyvm', :id, '--natdnsproxy1', 'on']
    v.customize ['modifyvm', :id, '--natdnshostresolver1', 'off']
  end

  ## Provisioning scripts ##

  # Pass vagrant_root variable to the VM and cd into the directory upon login.
  config.vm.provision "shell", run: "always" do |s|
    s.inline = <<-SCRIPT
      echo "export VAGRANT_ROOT=$1" >> /home/docker/.profile
      echo "cd $1" >> /home/docker/.ashrc
    SCRIPT
    s.args = "#{vagrant_mount_point}"
  end
  
  # Install dsh tool (Drude Shell) into VM's permanent storage.
  # https://github.com/blinkreaction/drude
  config.vm.provision "shell" do |s|
    s.inline = <<-SCRIPT
      # echo "Installing dsh (Drude Shell)..."
      sudo curl -sSL https://raw.githubusercontent.com/blinkreaction/drude/master/bin/dsh -o /var/lib/boot2docker/bin/dsh
      sudo chmod +x /var/lib/boot2docker/bin/dsh
      sudo ln -sf /var/lib/boot2docker/bin/dsh /usr/local/bin/dsh
    SCRIPT
  end

  # Let users provide credentials to log in to Docker Hub.
  if $vconfig['docker_registry_auth']
    config.vm.provision "trigger", :option => "value" do |trigger|
      trigger.fire do
        info 'Authenticating with the Docker registry...'
        system "docker -H localhost:2375 login"
      end
    end
    config.vm.provision "file", source: "~/.docker/config.json", destination: ".docker/config.json"
  end

  # System-wide dnsmasq service for DNS discovery and name resolution
  # Image: blinkreaction/dns-discovery v1.0.0
  config.vm.provision "shell", run: "always", privileged: false do |s|
    s.inline = <<-SCRIPT
      echo "Starting system-wide DNS service... "
      docker rm -f dns > /dev/null 2>&1 || true
      docker run -d --name dns --label "group=system" \
      -p $1:53:53/udp -p 172.17.42.1:53:53/udp --cap-add=NET_ADMIN --dns 10.0.2.3 \
      -v /var/run/docker.sock:/var/run/docker.sock \
      blinkreaction/dns-discovery@sha256:f1322ab6d5496c8587e59e47b0a8b1479a444098b40ddd598e85e9ab4ce146d8 > /dev/null 2>&1
    SCRIPT
    s.args = "#{box_ip}"
  end

  # System-wide vhost-proxy service.
  # Containers must define a "VIRTUAL_HOST" environment variable to be recognized and routed by the vhost-proxy.
  # Image: blinkreaction/nginx-proxy v1.1.0
  if $vconfig['vhost_proxy']
    config.vm.provision "shell", run: "always", privileged: false do |s|
      s.inline = <<-SCRIPT
        echo "Starting system-wide HTTP/HTTPS reverse proxy on $1... "
        docker rm -f vhost-proxy > /dev/null 2>&1 || true
        docker run -d --name vhost-proxy --label "group=system" -p $1:80:80 -p $1:443:443 \
        -v /var/run/docker.sock:/tmp/docker.sock \
        blinkreaction/nginx-proxy@sha256:1707c0fd2fa4f0e98a656f748a4edb8a04578e9dc63115acc23a05225f151e04 > /dev/null 2>&1
      SCRIPT
      s.args = "#{box_ip}"
    end
  end
  
  # Automatically start containers if docker-compose.yml is present in the current directory.
  # See "autostart" property in vagrant.yml.
  if File.file?('./docker-compose.yml') && $vconfig['compose_autostart']
    config.vm.provision "shell", run: "always", privileged: false do |s|
      s.inline = <<-SCRIPT
        echo "Found docker-compose.yml in the root folder. Starting containers..."
        cd $1
        docker-compose up
      SCRIPT
      s.args = "#{vagrant_mount_point}"
    end
  end

end
