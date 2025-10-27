class LoadTestingExperimentChannel < ApplicationCable::Channel
  def subscribed
    puts "subscribed with userid: #{params[:user_id]}"
    stream_from "load_testing_experiment_channel_#{params[:user_id]}"
  end

  def echo(data)
    puts "Echoing data back: #{data}"
    ActionCable.server.broadcast("load_testing_experiment_channel_#{params[:user_id]}", data)
  end
end
