// Run in a levelbuilder-studio.code.org page signed in as a levelbuilder,
// through chrome-devtools evaluate_script with sourcePath. Set
// window.LB_SNAPSHOT_CONFIG = {pathway, prefix, ids: [first, last], names}
// first; ids and names are optional. Returns what lb_snapshot.py split reads.
async () => {
  const {pathway: id, prefix, ids, names: extraNames = []} = window.LB_SNAPSHOT_CONFIG || {};
  if (!id || !prefix) return {error: 'set window.LB_SNAPSHOT_CONFIG = {pathway, prefix}'};
  const get = async u => {
    const r = await fetch(u, {credentials: 'include', headers: {Accept: 'application/json'}});
    return r.ok ? r.json() : {__status: r.status};
  };
  const user = (await get('/api/v1/users/current')).username;
  const pathway = await get(`/adaptive_pathways/${id}`);

  // get_filtered_levels repeats some rows and drops others, and a level
  // whose panels or question are copied inline is not named by the pathway;
  // pass ids or names to be sure of those.
  const levelIds = new Set();
  for (let page = 1; page <= 20; page++) {
    const j = await get(`/levels/get_filtered_levels?name=${encodeURIComponent(prefix)}&page=${page}`);
    if (j.__status) break;
    j.levels.forEach(l => levelIds.add(String(l.id)));
    if (page >= j.numPages) break;
  }
  const names = [...extraNames];
  if (!pathway.__status) {
    names.push(pathway.project?.templateLevel);
    for (const c of pathway.checkpoints || []) {
      for (const s of c.steps || []) {
        if (s.kind === 'level') names.push(s.level);
        // A Panels level's panel keys are its name plus a UUID.
        for (const p of s.panels || []) names.push(p.key.replace(/-[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/, ''));
      }
    }
  }
  await Promise.all([...new Set(names.filter(Boolean))].map(async name => {
    const j = await get(`/levels/by_name?name=${encodeURIComponent(name)}`);
    if (j.id) levelIds.add(String(j.id));
  }));
  if (ids) for (let i = ids[0]; i <= ids[1]; i++) levelIds.add(String(i));

  const levels = {};
  await Promise.all([...levelIds].map(async lid => {
    const j = await get(`/levels/${lid}/level_properties`);
    if (!j.__status && j[lid]) levels[lid] = j[lid];
  }));
  const adaptiveLevels = (await get('/levels/get_filtered_levels?level_type=Adaptive')).levels || [];
  return {fetchedAt: new Date().toISOString(), user, prefix, pathwayId: id, pathway, adaptiveLevels, levels};
}
