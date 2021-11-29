#!/usr/bin/env sysbench

function event()
   -- TODO:(suresh) Run this on initialization of the thread.
   max_user_level_id = 2098563437
   max_user_id = 50826205
   max_level_id = 17741
   max_script_id = 405
   max_level_source_id = 861968845

   -- TODO:(suresh) Declare these as local variables?  Switch to sb_rand_unique()?
   user_id = sb_rand(1, max_user_id)
   level_id = sb_rand(1, max_level_id)
   script_id = sb_rand(1, max_script_id)
   datetime = os.date("%Y-%m-%d %H:%M:%S", os.time())

   db_query("INSERT INTO dashboard_production.user_levels (user_id,level_id,attempts,created_at,updated_at,best_result,script_id,level_source_id,submitted,readonly_answers,unlocked_at) VALUES (" .. user_id .. "," .. level_id .. ",1,'" .. datetime .. "','" .. datetime .. "',30," .. script_id .. ",619210475,0,NULL,NULL) ON DUPLICATE KEY UPDATE attempts=attempts+1, updated_at='" .. datetime .. "'")

   -- Carry out 10 reads for each write to emulate production query patterns.
   for i=1,10 do
      db_query("SELECT * FROM dashboard_production.user_levels WHERE id=" .. sb_rand(1, max_user_level_id))
   end
end
