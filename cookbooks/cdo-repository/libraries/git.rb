# Patch Chef::Provider::Git to support creating/updating shallow clones.
class Chef
  class Provider
    class Git < Chef::Provider

      def clone
        converge_by("clone from #{@new_resource.repository} into #{@new_resource.destination}") do
          remote = @new_resource.remote

          args = []
          args << "-o #{remote}" unless remote == "origin"
          args << "--depth #{@new_resource.depth}" if @new_resource.depth
          # PATCH: Use --branch to checkout at clone time to avoid additional checkout step.
          args << "--branch #{@new_resource.checkout_branch}" unless @new_resource.enable_checkout
          # PATCH: Remove --no-single-branch to support shallow-clones.
          # args << "--no-single-branch" if @new_resource.depth and git_minor_version >= Gem::Version.new("1.7.10")

          Chef::Log.info "#{@new_resource} cloning repo #{@new_resource.repository} to #{@new_resource.destination}"

          clone_cmd = "git clone #{args.join(' ')} \"#{@new_resource.repository}\" \"#{@new_resource.destination}\""
          # PATCH: Add extra logging info.
          Chef::Log.info "Clone command: #{clone_cmd}"
          shell_out!(clone_cmd, run_options)
        end
      end

      def fetch_updates
        update_fetch_refs
        setup_remote_tracking_branches(@new_resource.remote, @new_resource.repository)
        converge_by("fetch updates for #{@new_resource.remote}") do
          # since we're in a local branch already, just reset to specified revision rather than merge
          # PATCH: Remove `&& git fetch --tags [remote]` and add --depth [depth] to support shallow fetch.
          fetch_command = "git fetch #{@new_resource.remote}#{" --depth #{@new_resource.depth}" if @new_resource.depth} && git reset --hard #{target_revision}"
          Chef::Log.debug "Fetching updates from #{new_resource.remote} and resetting to revision #{target_revision}"
          # PATCH: Add extra logging info.
          Chef::Log.info "Fetch command: #{fetch_command}"
          shell_out!(fetch_command, run_options(:cwd => @new_resource.destination))
        end
      end

      # Expand the remote.origin.fetch config to include the specified branch if needed.
      def update_fetch_refs
        branch = @new_resource.checkout_branch
        remote = @new_resource.remote
        cwd = @new_resource.destination

        # Skip update if either the exact or wildcard fetch-ref already exists in the config.
        ref_exists_cmd = <<-BASH
git config --get remote.#{remote}.fetch '^\\+refs/heads/#{branch}:refs/remotes/#{remote}/#{branch}$' || \
git config --get remote.#{remote}.fetch '^\\+refs/heads/\*:refs/remotes/#{remote}/\*$'
        BASH
        ref_exists = shell_out!(ref_exists_cmd, run_options(cwd: cwd, returns: [0,1])).exitstatus == 0

        unless ref_exists
          update_fetch_refs_cmd = "git config --add remote.#{remote}.fetch +refs/heads/#{branch}:refs/remotes/#{remote}/#{branch}"
          Chef::Log.info "Update fetch refs command: #{update_fetch_refs_cmd}"
          shell_out!(update_fetch_refs_cmd, cwd: cwd)
        end
      end
    end
  end
end
