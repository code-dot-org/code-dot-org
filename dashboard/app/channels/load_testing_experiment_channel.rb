class LoadTestingExperimentChannel < ApplicationCable::Channel
  def subscribed
    stream_from "load_testing_experiment_channel_#{current_user.id}"
  end

  def echo(data)
    ActionCable.server.broadcast("load_testing_experiment_channel_#{current_user.id}", data)
  end
end
