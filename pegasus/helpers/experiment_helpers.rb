
def experiment_enabled?(experiment)
  experiments = params[:enableExperiments]
  !!(experiments && experiments.include?(experiment))
end
