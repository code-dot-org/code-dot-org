class LoadTestingExperimentChannel < ApplicationCable::Channel
  def subscribed
    puts "subscribed with userid: #{current_user.id}"
    stream_from "load_testing_experiment_channel_#{current_user.id}"
  end

  def echo(data)
    puts "Echoing data back: #{data}"
    ActionCable.server.broadcast("load_testing_experiment_channel_#{current_user.id}", data)
  end
end
