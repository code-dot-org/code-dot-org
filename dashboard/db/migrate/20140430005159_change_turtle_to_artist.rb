class ChangeTurtleToArtist < ActiveRecord::Migration
  def change
    Level.connection.execute("UPDATE levels SET type='Artist' where type='Turtle'")
  end
end
