class UnmodifyFollowersIndex < ActiveRecord::Migration
  def change
    c = Follower.connection
    c.execute('create temporary table temp_follower_dups (user_id int, student_user_id int, max_id int)')
    c.execute('insert into temp_follower_dups select user_id, student_user_id, max(id) from followers group by user_id, student_user_id having count(*) > 1')
    c.execute('delete f from followers f inner join temp_follower_dups tfd on tfd.user_id = f.user_id and tfd.student_user_id = f.student_user_id and tfd.max_id != f.id')

    remove_index(:followers, [:user_id,:student_user_id, :section_id])
    add_index :followers, [:user_id,:student_user_id], unique: true
  end
end
