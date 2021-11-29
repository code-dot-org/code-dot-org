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

MAX_USER_LEVEL_ID = 3344711209
MAX_USER_ID = 79248804
MAX_LEVEL_ID = 27369
MAX_SCRIPT_ID = 3192
MAX_LEVEL_SOURCE_ID = 1388006336
MAX_USER_SCRIPT_ID = 139640482
MAX_STORAGE_APPS_ID = 444183673
MAX_USER_STORAGE_ID = 296919242
MAX_HOC_ACTIVITY_ID = 1211366424
MAX_AUTH_OPTION_ID = 26118801
LEVEL_SOURCE_DATA = [[<xml><block type="craft_whenNight" deletable="false"><statement name="DO"><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></statement></block><block type="craft_zombieSpawnedTouchedClickedDay" deletable="false"><statement name="WHEN_SPAWNED"><block type="craft_wait"><title name="TYPE">0.4</title><next><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></next></block></statement><statement name="WHEN_TOUCHED"><block type="craft_wait"><title name="TYPE">2.0</title><next><block type="craft_attack"><next><block type="craft_moveToward"><title name="TYPE">Player</title></block></next></block></next></block></statement><statement name="WHEN_USED"><block type="craft_flashEntity"><next><block type="craft_destroyEntity"></block></next></block></statement><statement name="WHEN_DAY"><block type="craft_destroyEntity"></block></statement></block></xml>]]
STORAGE_APPS_VALUE = [[{\"hidden\":true,\"createdAt\":\"2019-09-22T04:05:08.511+00:00\",\"updatedAt\":\"2019-09-22T04:05:08.511+00:00\"}]]

function init_query_templates()
  -- TODO: read_queries are currently not used 
  read_queries = {
    {
      qps = 276.88,
      query = [[
        SELECT SQL_NO_CACHE .*
        FROM dashboard_production.user_levels
        WHERE `user_levels`.`user_id` = 53678641
          AND `user_levels`.`script_id` = 18
        ORDER BY id desc
      ]]
    },
    {
      qps = 841.26,
      query = [[
        SELECT *
        FROM dashboard_production.users
        WHERE `users`.`deleted_at` IS NULL
          AND `users`.`id` = $userId
          ORDER BY `users`.`id` ASC LIMIT 1
      ]]
    },
    {
      qps = 877.01,
      query = [[
        SELECT SQL_NO_CACHE *
        FROM dashboard_production.user_levels
        WHERE `user_levels`.`user_id` = 46298294
          AND `user_levels`.`level_id` = 11984
          AND `user_levels`.`script_id` = 302
        ORDER BY updated_at DESC LIMIT 1
      ]]
    },
    {
      qps = 167.14,
      query = [[
        SELECT SQL_NO_CACHE `navigator_user_level_id`
        FROM dashboard_production.paired_user_levels
        WHERE `paired_user_levels`.`navigator_user_level_id` IN (2262860859, 2262857656, 2262662932, 2262661336, 2262660893, 2262660349, 2262660085, 2262656913, 2262656652, 2262656439, 2262656271, 2262656174, 2262656150, 2262654225, 2262652487, 2262651301, 2262650520, 2262648116, 2262647732, 2260334910, 2260333466, 2260331176, 2260324612, 2260321573, 2260315040, 2260314054, 2260313713, 2260312107, 2260309438, 2260308371, 2260307343, 2260305577, 2260304574, 2260304144, 2260303825, 2260303111, 2260302649, 2260302433, 2260302070, 2260301498, 2260301300, 2260301066)
      ]]
    },
    {
      qps = 167.13,
      query = [[
        SELECT SQL_NO_CACHE `driver_user_level_id`
        FROM dashboard_production.paired_user_levels
        WHERE `paired_user_levels`.`driver_user_level_id` IN (2262860859, 2262857656, 2262662932, 2262661336, 2262660893, 2262660349, 2262660085, 2262656913, 2262656652, 2262656439, 2262656271, 2262656174, 2262656150, 2262654225, 2262652487, 2262651301, 2262650520, 2262648116, 2262647732, 2260334910, 2260333466, 2260331176, 2260324612, 2260321573, 2260315040, 2260314054, 2260313713, 2260312107, 2260309438, 2260308371, 2260307343, 2260305577, 2260304574, 2260304144, 2260303825, 2260303111, 2260302649, 2260302433, 2260302070, 2260301498, 2260301300, 2260301066)
      ]]
    },
    {
      qps = 472.48,
      query = [[
        SELECT SQL_NO_CACHE 1 AS one
        FROM dashboard_production.sections as sections
        INNER JOIN dashboard_production.followers as followers
           ON `sections`.`id` = `followers`.`section_id`
        WHERE `sections`.`deleted_at` is null
                AND `followers`.`deleted_at` is null
                AND `followers`.`student_user_id` = 13140377 limit 1
      ]]
    },
    {
      qps = 162.83,
      query = [[
        SELECT SQL_NO_CACHE `level_sources`.*
        FROM dashboard_production.level_sources
        WHERE `level_id` = 901
          AND `md5` = 'cfcd208495d565ef66e7dff9f98764da'
        ORDER BY `level_sources`.`id` ASC LIMIT 1
      ]]
    },
    {
      qps = 571.23,
      query = [[
        SELECT *
        FROM pegasus.user_storage_ids
        WHERE (`user_id` = $userId)
        LIMIT 1
      ]]
    },
    {
      qps = 260.01,
      query = [[
        SELECT SQL_NO_CACHE *
        FROM dashboard_production.section_hidden_stages
        WHERE `stage_id` = 1020
          AND `section_id` = 2280903
        LIMIT 1
      ]]
    },
    {
      qps = 58.13,
      query = [[
        SELECT SQL_NO_CACHE `users`.*
        FROM dashboard_production.users as users
        INNER JOIN dashboard_production.followers as followers
          ON `users`.`id` = `followers`.`student_user_id`
        WHERE `users`.`deleted_at` IS NULL
          AND `followers`.`deleted_at` IS NULL
          AND `followers`.`section_id` = 2297605
        ORDER BY name
      ]]
    },
  }

  -- queries per second values taken from Percona for peak hours (~ 7 AM to 12 PM PST on a school day - Oct 21, 2019).
  write_queries = {
    {
      qps = 8.82,
      query = [[
        UPDATE pegasus.storage_apps
        SET `value` = '$storageAppsValue', `updated_at` = '$date', `updated_ip` = '71.80.212.17'
        WHERE ((`id` = $storageAppId) AND (`state` != 'deleted'))
      ]]
    },
    {
      qps = 6.57,
      query = [[
        UPDATE dashboard_production.users
        SET `current_sign_in_at` = '$date', `last_sign_in_at` = '$date', `sign_in_count` = 9, `updated_at` = '$date'
        WHERE `users`.`id` = $userId
      ]]
    },
    {
      qps = 6.12,
      query = [[
        UPDATE dashboard_production.authentication_options
        SET `data` = '$authOptionsData' , `updated_at` = '$date'
        WHERE `authentication_options` . `id` = $authOptionId
      ]]
    },
    {
      qps = 12.18,
      query = [[
        UPDATE pegasus.hoc_activity
        SET `country` = 'United States', `country_code` = 'US', `state` = 'Nevada', `state_code` = 'NV', `city` = 'Las Vegas', `location` = '36.0588, -115.3104'
        WHERE (`id` = $hocActivityId)
      ]]
    },
    {
      qps = 24.21,
      query = [[
        UPDATE dashboard_production.user_levels
        SET `best_result` = 11, `attempts` = 2, `level_source_id` = $levelSourceId, `updated_at` = '$date'
        WHERE `user_levels`.`id` = $userLevelId
      ]]
    },
    {
      qps = 37.81,
      query = [[
        UPDATE dashboard_production.user_levels
        SET `attempts` = 45, `updated_at` = '$date'
        WHERE `user_levels`.`id` = $userLevelId
      ]]
    },
    {
      qps = 80.43,
      query = [[
        UPDATE dashboard_production.user_scripts
        SET `last_progress_at` = '$date', `updated_at` = '$date'
        WHERE `user_scripts`.`id` = $userScriptId
      ]]
    },
    {
      qps = 65.30,
      query = [[
        UPDATE dashboard_production.user_levels
        SET `attempts` = 14, `level_source_id` = $levelSourceId, `updated_at` = '$date'
        WHERE `user_levels`.`id` = $userLevelId
      ]]
    },
    {
      qps = 70.56,
      query = [[
        UPDATE dashboard_production.users
        SET `users`.`total_lines` = 1206
        WHERE `users`.`deleted_at` is null AND `users`.`id` = $userId
      ]]
    },
    {
      qps = 201.21,
      query = [[
        UPDATE pegasus.storage_apps
        SET `value` = '$storageAppsValue', `updated_at` = '$date', `updated_ip` = '24.86.5.86', `project_type` = 'spritelab'
        WHERE ((`id` = $storageAppId) AND (`state` != 'deleted'))
      ]]
    },
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
    userId = math.random(1, MAX_USER_ID),
    levelId = math.random(1, MAX_USER_LEVEL_ID),
    scriptId = math.random(1, MAX_SCRIPT_ID),
    levelId = math.random(1, MAX_LEVEL_ID),
    levelSourceId = math.random(1, MAX_LEVEL_SOURCE_ID),
    userLevelId = math.random(1, MAX_USER_LEVEL_ID),
    date = os.date("%Y-%m-%d %H:%M:%S", os.time()),
    levelSourceData = LEVEL_SOURCE_DATA,
    storageAppsValue = STORAGE_APPS_VALUE,
    storageAppId = math.random(1, MAX_STORAGE_APPS_ID),
    userStorageId = math.random(1, MAX_USER_STORAGE_ID),
    userScriptId = math.random(1, MAX_USER_SCRIPT_ID),
    session = sysbench.rand.string(string.rep("@", sysbench.rand.special(36, 36))), -- Random string of length 36
    referer = sysbench.rand.string(string.rep("@", sysbench.rand.special(5, 15))),
    tutorial = sysbench.rand.string(string.rep("@", sysbench.rand.special(5, 15))),
    hocActivityId = math.random(1, MAX_HOC_ACTIVITY_ID),
    authOptionId = math.random(1, MAX_AUTH_OPTION_ID),
    authOptionsData = sysbench.rand.string(string.rep("@", sysbench.rand.special(10, 400)))
  }

  -- Simple string interpolation from: https://hisham.hm/2016/01/04/string-interpolation-in-lua/
  -- "variable" names must be alphanumeric characters only.
  -- local query = string.gsub(write_queries[1]['query'], "%$(%w+)", vars)
  local query = string.gsub(random_query_weighted(), "%$(%w+)", vars)
  -- local use_trx = string.find(query, "dashboard_production")
  local use_trx = false

  if use_trx then
    con:query("BEGIN")
  end

  con:query(query)

  if use_Trx then
    con:query("COMMIT")
  end
end
