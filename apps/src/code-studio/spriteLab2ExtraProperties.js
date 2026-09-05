// A raw JSON editor for the Sprite Lab in Lab2 level flags that shipped
// before their editor UI, injected onto the level edit page. Everything it
// needs from the server already exists — values come from the level's
// level_properties endpoint and saves go through the levelbuilder's
// update_properties endpoint — so this feature is entirely client-side.
// Loaded as part of the levelbuilder bundle; on pages that aren't a saved
// Lab2 Sprite Lab level's edit form, init finds nothing to do.

import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import initializeCodeMirror6 from './initializeCodeMirror6';

// The flags this box may show and write. Explicit on purpose: it is the
// burndown of properties still lacking real UI — remove an entry when its
// editor lands, and the section retires with the last one. Deliberately
// absent: ai_code_generate_adlib/_text (declared in the lab's types but
// consumed only by Music Lab so far) and the classic-era flags
// (mini_toolbox, instructions_icon, ...) — the charter here is Lab2 flags.
export const RAW_EDITABLE_PROPERTIES = [
  'guide_mode',
  'guide_steps',
  'hide_custom_blocks',
  'images_advanced',
  'locked_image_type',
  'pinned_scene_id',
  'pinned_scene_name',
  'show_world_tab',
  'visible_tabs',
  'world_grid_size',
];

// level_properties camelizes property names; saves use the stored
// snake_case names. Exported for its unit test.
export function camelize(snakeName) {
  return snakeName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Init fires one load and every save fires another; a stale response must
// not overwrite a newer dump.
let loadEpoch = 0;

document.addEventListener('DOMContentLoaded', init);

function init() {
  // A saved level's edit form (a new level's form is #new_level), for a
  // Sprite Lab level (the exact type: Dancelab and Poetry subclass it and
  // must not get the section) with Lab2 enabled.
  const form = document.querySelector('form.edit_level');
  const levelId = form?.getAttribute('action')?.match(/\/levels\/(\d+)/)?.[1];
  if (
    !levelId ||
    document.getElementById('level_type')?.value !== 'GamelabJr' ||
    !document.getElementById('level_uses_lab2')?.checked
  ) {
    return;
  }
  form.insertAdjacentElement('afterend', buildSection());
  const textarea = document.getElementById('extra_properties_json');
  const status = document.getElementById('extra_properties_status');

  loadCurrentValues(levelId);

  document
    .getElementById('extra_properties_save')
    .addEventListener('click', () => save(levelId, status));

  // After the save button is wired: if CodeMirror fails to set up, the
  // section still saves — the user just types into a plain textarea.
  try {
    initializeCodeMirror6('extra_properties_json', 'json', {
      // Fires after document changes (debounced); also what turns the lint
      // gutter on. A stale "Saved." next to edited text would claim the
      // edit is saved. Lint passes for pre-save typing can land mid-save,
      // so the edited-during-save signal is a text comparison, not this.
      onUpdateLinting: () => {
        if (status.textContent !== 'Saving…') {
          status.textContent = '';
        }
      },
    });
  } catch {
    // CodeMirror hides the textarea before mounting; put it back so the
    // box still works as a plain textarea.
    textarea.style.display = '';
  }
}

// All static markup — nothing user-controlled passes through innerHTML
// (values render later via textContent).
function buildSection() {
  const section = document.createElement('div');
  section.innerHTML = `
    <h1 class="control-legend collapsed" data-toggle="collapse" data-target="#extra_properties_area">
      Additional properties (JSON)
    </h1>
    <div id="extra_properties_area" class="collapse" style="margin-bottom: 80px;">
      <pre id="extra_properties_current" style="max-height: 300px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere;">Loading current values…</pre>
      <p>
        The level's Sprite Lab in Lab2 flags that have no editor UI yet —
        <code>null</code> means unset.  Only these keys save here; every
        other property has its own editor.
      </p>
      <p>Enter properties to change as JSON — for example <code>{"show_world_tab": true}</code></p>
      <p>
        Keys are top-level property names, and each key's value replaces
        that property whole — to change part of a nested value, copy the
        whole value from above, edit it, and save it back.  A key set to
        <code>null</code> — or to any empty or false value — is removed,
        since properties store no blanks: flags are <code>true</code> or
        absent.
      </p>
      <textarea id="extra_properties_json" rows="6" style="width: 100%; box-sizing: border-box; resize: vertical;"></textarea>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button type="button" id="extra_properties_save" class="btn" style="text-shadow: none;">
          Save additional properties
        </button>
        <span id="extra_properties_status" role="status"></span>
      </div>
    </div>`;
  // The bottom margin on the area keeps the Save button clear of the
  // page's fixed save-and-publish bar; text-shadow off because Bootstrap's
  // .btn white shadow reads as doubled text.
  return section;
}

// The dump enumerates every editable key, set or not, so it reads like a
// form of the available knobs — and it always shows what the server
// stored, never what was submitted, since it is the documented copy-source
// for nested edits. level_properties returns the properties the lab itself
// consumes, keyed by level id, names camelized.
async function loadCurrentValues(levelId) {
  const epoch = ++loadEpoch;
  const pre = document.getElementById('extra_properties_current');
  try {
    const response = await HttpClient.fetchJson(
      `/levels/${levelId}/level_properties`,
      {headers: {Accept: 'application/json'}}
    );
    if (epoch !== loadEpoch) {
      return;
    }
    const properties = response.value[levelId] || {};
    const display = {};
    RAW_EDITABLE_PROPERTIES.forEach(key => {
      display[key] = properties[camelize(key)] ?? null;
    });
    pre.textContent = JSON.stringify(display, null, 2);
  } catch {
    if (epoch === loadEpoch) {
      pre.textContent = "Couldn't load current values — saving still works.";
    }
  }
}

async function save(levelId, status) {
  const textarea = document.getElementById('extra_properties_json');
  const saveButton = document.getElementById('extra_properties_save');
  let changes;
  try {
    changes = JSON.parse(textarea.value);
  } catch (e) {
    status.textContent = `Not valid JSON: ${e.message}`;
    return;
  }
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    status.textContent = 'Enter a JSON object of property names and values.';
    return;
  }
  const unknown = Object.keys(changes).find(
    key => !RAW_EDITABLE_PROPERTIES.includes(key)
  );
  if (unknown) {
    status.textContent = `${unknown} isn't in this level's editable list — everything else has its own editor.`;
    return;
  }
  saveButton.disabled = true;
  const sentText = textarea.value;
  status.textContent = 'Saving…';
  try {
    await HttpClient.post(
      `/levels/${levelId}/update_properties`,
      JSON.stringify(changes),
      true,
      {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
      }
    );
    await loadCurrentValues(levelId);
    // An unpublished level's save reaches the database but not its .level
    // file (only published levels are written to disk); the next publish
    // writes the file with these properties included.
    const published =
      document.getElementById('level_published')?.value === 'true';
    const suffixes = [];
    if (!published) {
      suffixes.push(
        'the level is unpublished, so use "Save and publish" to get this into its .level file'
      );
    }
    if (textarea.value !== sentText) {
      suffixes.push('the box has newer, unsaved edits');
    }
    status.textContent = suffixes.length
      ? `Saved — ${suffixes.join('; ')}.`
      : 'Saved.';
  } catch (e) {
    // A failure with a JSON body may carry its reason there; HttpClient's
    // error itself has only the status line.
    let message = e.message;
    if (isNetworkError(e)) {
      const body = await e.response.json().catch(() => null);
      if (body?.error) {
        message = body.error;
      }
    }
    status.textContent = `Save failed: ${message}`;
  } finally {
    saveButton.disabled = false;
  }
}
