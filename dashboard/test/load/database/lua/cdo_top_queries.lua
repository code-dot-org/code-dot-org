#!/usr/bin/env sysbench

-- init/teardown code taken from: https://www.percona.com/blog/2019/04/25/creating-custom-sysbench-scripts/

-- Called by sysbench one time to initialize this script
function thread_init()
  math.randomseed(os.time())
  init_query_templates() 
 
  -- drv - initialize the sysbench mysql driver
  drv = sysbench.sql.driver()
 
  -- con - represents the connection to MySQL
  con = drv:connect()
end
 
-- Called by sysbench when script is done executing
function thread_done()
  -- Disconnect/close connection to MySQL
  con:disconnect()
end

MAX_USER_LEVEL_ID = 2098563437
MAX_USER_ID = 50826205
MAX_LEVEL_ID = 17741
MAX_SCRIPT_ID = 405
MAX_LEVEL_SOURCE_ID = 861968845
MAX_STORAGE_APPS_ID = 183149199
MAX_USER_STORAGE_ID = 101520617
LEVEL_SOURCE_DATA = [[<xml><block type="craft_whenNight" deletable="false"><statement name="DO"><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></statement></block><block type="craft_zombieSpawnedTouchedClickedDay" deletable="false"><statement name="WHEN_SPAWNED"><block type="craft_wait"><title name="TYPE">0.4</title><next><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></next></block></statement><statement name="WHEN_TOUCHED"><block type="craft_wait"><title name="TYPE">2.0</title><next><block type="craft_attack"><next><block type="craft_moveToward"><title name="TYPE">Player</title></block></next></block></next></block></statement><statement name="WHEN_USED"><block type="craft_flashEntity"><next><block type="craft_destroyEntity"></block></next></block></statement><statement name="WHEN_DAY"><block type="craft_destroyEntity"></block></statement></block></xml>]]
STORAGE_APPS_VALUE = [[{\"hidden\":true,\"createdAt\":\"2019-09-22T04:05:08.511+00:00\",\"updatedAt\":\"2019-09-22T04:05:08.511+00:00\"}]]

function init_query_templates()
  -- TODO: read_queries are currently not used 
  --[==[
  read_queries = {
    {
      qps = 0,
      query = [[
        SELECT *
        FROM dashboard_production.users
        WHERE deleted_at is null
              AND id = $userId
        ORDER BY id ASC limit 1
      ]]
    },
    {
      qps = 0,
      query = [[
        SELECT *
        FROM pegasus.user_storage_ids
        WHERE user_id = $userId limit 1
      ]]
    },
  }
  --]==]

  -- queries per second values taken from Percona for peak hours (~ 7 AM to 12 PM PST on a school day).
  write_queries = {
    {
      qps = 10.60,
      query = [[
        INSERT INTO pegasus.hoc_activity
        (`referer`, `tutorial`, `company`, `pixel_started_at`, `pixel_started_ip`, `session`)
        VALUES ('$referer', '$tutorial', NULL, '$date', '172.58.111.150', '$session')
      ]]
    },
    {
      qps = 70.34,
      query = [[
        INSERT INTO dashboard_production.user_levels
        (`user_id`, `level_id`, `attempts`, `created_at`, `updated_at`, `best_result`, `script_id`, `level_source_id`, `submitted`)
        VALUES ($userId, $levelId, 1, '$date', '$date', 11, $scriptId, $levelSourceId, 0)
      ]]
    },
    {
      qps = 27.91,
      query = [[
        INSERT INTO dashboard_production.level_sources
        (`level_id`, `md5`, `data`, `created_at`, `updated_at`)
        VALUES ($levelId, '60c5580746e447bd0b9c4b6a7eb2a685', '$levelSourceData', '$date', '$date')
      ]]
    },
    {
      qps = 18.44,
      query = [[
        INSERT INTO pegasus.storage_apps
        (`storage_id`, `value`, `created_at`, `updated_at`, `updated_ip`, `abuse_score`, `project_type`, `published_at`, `remix_parent_id`, `skip_content_moderation`, `standalone`)
        VALUES (92938404, '$storageAppsValue', '$date', '$date', '14.229.194.186', 0, NULL, NULL, NULL, 0, 0)
      ]]
    },
    {
      qps = 18.87,
      query = [[
        INSERT INTO dashboard_production.user_levels
        (`user_id`, `level_id`, `attempts`, `created_at`, `updated_at`, `best_result`, `script_id`, `submitted`)
        VALUES ($userId, $levelId, 1, '$date', '$date', 3, $scriptId, 0)
      ]]
    },
    {
      qps = 13.74,
      query = [[
        INSERT INTO dashboard_production.sign_ins
        (`user_id`, `sign_in_at`, `sign_in_count`)
        VALUES ($userId, '$date', 9)
      ]]
    },
    {
      qps = 15.29,
      query = [[
        INSERT INTO dashboard_production.channel_tokens
        (`storage_app_id`, `level_id`, `created_at`, `updated_at`, `storage_id`)
        VALUES ($storageAppId, $levelId, '$date', '$date', $userStorageId)
      ]]
    },
    {
      qps = 15.16,
      query = [[
        INSERT INTO pegasus.user_storage_ids (`user_id`) VALUES (NULL)
      ]]
    },
  }

  total_qps = 0
  for i, v in pairs(write_queries) do
    total_qps = total_qps + v['qps']
  end

  lower_bound = 0
  queries_with_ranges = {}
  for i, v in pairs(write_queries) do
    local new_entry = {
      query = v['query'],
      lower_bound = lower_bound,
      upper_bound = lower_bound + (v['qps'] / total_qps)
    }
    table.insert(queries_with_ranges, new_entry)
    lower_bound = new_entry['upper_bound']
  end

  -- The upper bound value for the last entry should already 1.0 anyways, but set it explicitly in case of floating point math error
  queries_with_ranges[#queries_with_ranges]['upper_bound'] = 1.0
end

function random_query_weighted()
  local rand_val = math.random()

  for i, v in pairs(queries_with_ranges) do
    if rand_val >= v['lower_bound'] and rand_val < v['upper_bound'] then
      return v['query']
    end
  end
end 

function event()
  local vars = {
    userId = sb_rand(1, MAX_USER_ID),
    levelId = sb_rand(1, MAX_USER_LEVEL_ID),
    scriptId = sb_rand(1, MAX_SCRIPT_ID),
    levelId = sb_rand(1, MAX_LEVEL_ID),
    levelSourceId = sb_rand(1, MAX_LEVEL_SOURCE_ID),
    date = os.date("%Y-%m-%d %H:%M:%S", os.time()),
    levelSourceData = LEVEL_SOURCE_DATA,
    storageAppsValue = STORAGE_APPS_VALUE,
    storageAppId = sb_rand(1, MAX_STORAGE_APPS_ID),
    userStorageId = sb_rand(1, MAX_USER_STORAGE_ID),
    session = sysbench.rand.string(string.rep("@", sysbench.rand.special(36, 36))), -- Random string of length 36
    referer = sysbench.rand.string(string.rep("@", sysbench.rand.special(5, 15))),
    tutorial = sysbench.rand.string(string.rep("@", sysbench.rand.special(5, 15))),
  }

  -- Simple string interpolation from: https://hisham.hm/2016/01/04/string-interpolation-in-lua/
  -- "variable" names must be alphanumeric characters only.
  local query = string.gsub(random_query_weighted(), "%$(%w+)", vars)

  con:query(query)
end
