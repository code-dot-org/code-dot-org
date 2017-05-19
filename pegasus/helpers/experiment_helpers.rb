
def experiment_enabled?(experiment)
  experiments = params[:enableExperiments]
  !!(experiments and experiments.include?(experiment))
end
