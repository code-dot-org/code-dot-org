class ChangeTurtleToArtist < ActiveRecord::Migration[4.2]
  def change
    Level.connection.execute("UPDATE levels SET type='Artist' where type='Turtle'")
  end
end
