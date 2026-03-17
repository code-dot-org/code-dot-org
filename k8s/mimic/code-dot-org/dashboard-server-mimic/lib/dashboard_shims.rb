MIMIC_ROOT = File.expand_path("../..", __dir__)

def deploy_dir(*dirs)
  File.join(MIMIC_ROOT, *dirs)
end

def dashboard_dir(*dirs)
  deploy_dir("dashboard", *dirs)
end

def rack_env
  CDO.rack_env.to_sym
end
