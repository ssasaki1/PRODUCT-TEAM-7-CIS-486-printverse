//  USER AUTH CONTROL

// Check if logged in user exists
let currentUser = JSON.parse(localStorage.getItem("printverseUser")) || null;

// If nobody logged in, redirect to login page
if (!currentUser) {
  window.location.href = "login.html";
}

// Extract real ID for use in API calls
const USER_ID = currentUser.id;


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('instruction-form');
  const input = document.getElementById('instruction-input');
  const presetName = document.getElementById('preset-name');
  const resetButton = document.getElementById('reset-button');

  const resultPanel = document.getElementById('result');
  const settingsList = document.getElementById('settings-list');
  const rawJsonPre = document.getElementById('raw-json');
  const status = resultPanel.querySelector('.status');

  const saveButton = document.getElementById('save-button');
  const savedList = document.getElementById('saved-settings');
  const savedStatus = document.getElementById('saved-status');

  const printButton = document.getElementById('print-button');
  const printModal = document.getElementById('print-modal');
  const printSummary = document.getElementById('print-summary');
  const confirmPrint = document.getElementById('confirm-print');
  const closePrintModal = document.getElementById('close-print-modal');

  const USER_ID = 'testuser'; // TODO: replace with real user id

  let currentSettings = null;   // current JSON settings (generated / loaded / edited)
  let currentSettingId = null;  // which saved preset (if any) is being edited

  // ==========================
  // Helpers
  // ==========================

  function defaultSettings() {
    return {
      copies: 1,
      color: 'color',
      duplex: false,
      paperSize: 'A4',
      orientation: 'portrait',
    };
  }

  function ensureCurrentSettings() {
    if (!currentSettings) {
      currentSettings = defaultSettings();
    }
  }

  function renderSettings(settings) {
    if (!settings) {
      settingsList.innerHTML = '';
      return;
    }

    settingsList.innerHTML = `
      <li><strong>Copies:</strong> ${settings.copies ?? '-'}</li>
      <li><strong>Color mode:</strong> ${settings.color ?? '-'}</li>
      <li><strong>Duplex:</strong> ${settings.duplex ? 'Yes' : 'No'}</li>
      <li><strong>Paper size:</strong> ${settings.paperSize ?? '-'}</li>
      <li><strong>Orientation:</strong> ${settings.orientation ?? '-'}</li>
    `;
  }

  function renderRawJson(settings) {
    rawJsonPre.textContent = JSON.stringify(settings || {}, null, 2);
  }

  // Build a natural-language sentence from currentSettings
  function updateInstructionFromSettings() {
    if (!currentSettings) return;

    const copiesText = currentSettings.copies ? `${currentSettings.copies} copies` : '';
    const colorText = currentSettings.color === 'mono' ? 'black and white' : 'color';
    const duplexText = currentSettings.duplex ? 'double sided' : 'single sided';
    const sizeText = currentSettings.paperSize || '';
    const orientText = currentSettings.orientation || '';

    let sentence = `Print ${copiesText}, ${colorText}, ${duplexText}, ${sizeText}, ${orientText}.`;
    sentence = sentence
      .replace(/\s+,/g, ',')
      .replace(/,\s+\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();

    input.value = sentence;
  }

  function updateChipStates() {
    const colorChips = document.querySelectorAll('[data-color-option]');
    colorChips.forEach((btn) => {
      btn.classList.toggle(
        'active',
        currentSettings && currentSettings.color === btn.getAttribute('data-color-option')
      );
    });

    const duplexChips = document.querySelectorAll('[data-duplex-option]');
    duplexChips.forEach((btn) => {
      const val = btn.getAttribute('data-duplex-option') === 'true';
      btn.classList.toggle('active', currentSettings && currentSettings.duplex === val);
    });

    const sizeChips = document.querySelectorAll('[data-size-option]');
    sizeChips.forEach((btn) => {
      btn.classList.toggle(
        'active',
        currentSettings && currentSettings.paperSize === btn.getAttribute('data-size-option')
      );
    });

    const orientationChips = document.querySelectorAll('[data-orientation-option]');
    orientationChips.forEach((btn) => {
      btn.classList.toggle(
        'active',
        currentSettings && currentSettings.orientation === btn.getAttribute('data-orientation-option')
      );
    });

    const copiesChips = document.querySelectorAll('[data-copies-option]');
    copiesChips.forEach((btn) => {
      const val = parseInt(btn.getAttribute('data-copies-option'), 10);
      btn.classList.toggle(
        'active',
        currentSettings && Number(currentSettings.copies) === val
      );
    });
  }

  async function autoUpdateSavedSetting() {
    // Only auto-update if we’re editing an existing preset
    if (!currentSettingId || !currentSettings) return;

    const name = presetName.value.trim() || 'Untitled preset';

    const payload = {
      userId: USER_ID,
      name,
      ...currentSettings,
    };

    try {
      const res = await fetch(`/print-settings/${currentSettingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        savedStatus.textContent = 'Changes auto-saved.';
        currentSettingId = data._id;
        loadSavedSettings();
      } else {
        savedStatus.textContent = data.error || 'Failed to auto-save.';
      }
    } catch (err) {
      console.error(err);
      savedStatus.textContent = 'Error auto-saving setting.';
    }
  }

  // Re-parse the textarea into settings (used before saving)
  async function syncSettingsFromText() {
    const text = input.value.trim();
    if (!text) return false; // nothing to sync

    try {
      status.textContent = 'Updating settings from text...';

      const response = await fetch('/api/parse-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      currentSettings = data.settings;
      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      // Do NOT call updateInstructionFromSettings() here;
      // we don't want to overwrite the user's text.
      status.textContent = 'Settings synced from text.';
      return true;
    } catch (err) {
      console.error(err);
      status.textContent = `Error syncing from text: ${err.message}`;
      return false;
    }
  }

  // ==========================
  // Generate Printer Settings (AI)
  // ==========================

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) {
      status.textContent = 'Please type some instructions first.';
      return;
    }

    status.textContent = 'Understanding your request...';
    settingsList.innerHTML = '';
    rawJsonPre.textContent = '{}';

    try {
      const response = await fetch('/api/parse-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      const s = data.settings;

      currentSettings = s;
      // NOTE: if we were editing a preset, we keep currentSettingId
      renderSettings(s);
      renderRawJson(s);
      updateChipStates();
      updateInstructionFromSettings(); // keep textarea synced with JSON
      status.textContent = 'Settings generated successfully.';
    } catch (err) {
      console.error(err);
      status.textContent = `Error: ${err.message}`;
    }
  });

  // ==========================
  // Reset
  // ==========================

  resetButton.addEventListener('click', () => {
    input.value = '';
    presetName.value = '';
    currentSettings = null;
    currentSettingId = null;
    settingsList.innerHTML = '';
    rawJsonPre.textContent = '{}';
    updateChipStates();
    status.textContent = 'Reset complete.';
    savedStatus.textContent = '';
  });

  // ==========================
  // Quick Settings Chips
  // ==========================

  document.addEventListener('click', (e) => {
    let changed = false;

    // Allow chips even when nothing has been generated yet
    if (
      e.target.matches('[data-color-option]') ||
      e.target.matches('[data-duplex-option]') ||
      e.target.matches('[data-size-option]') ||
      e.target.matches('[data-orientation-option]') ||
      e.target.matches('[data-copies-option]')
    ) {
      ensureCurrentSettings();
    }

    if (e.target.matches('[data-color-option]')) {
      currentSettings.color = e.target.getAttribute('data-color-option');
      changed = true;
    }

    if (e.target.matches('[data-duplex-option]')) {
      currentSettings.duplex = e.target.getAttribute('data-duplex-option') === 'true';
      changed = true;
    }

    if (e.target.matches('[data-size-option]')) {
      currentSettings.paperSize = e.target.getAttribute('data-size-option');
      changed = true;
    }

    if (e.target.matches('[data-orientation-option]')) {
      currentSettings.orientation = e.target.getAttribute('data-orientation-option');
      changed = true;
    }

    if (e.target.matches('[data-copies-option]')) {
      currentSettings.copies = parseInt(
        e.target.getAttribute('data-copies-option'),
        10
      );
      changed = true;
    }

    if (changed) {
      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      updateInstructionFromSettings(); // update textarea too
      status.textContent = 'Settings updated manually.';
      autoUpdateSavedSetting();        // if editing a saved preset, push to DB
    }
  });

  // ==========================
  // Save / Update Settings
  // ==========================

  saveButton.addEventListener('click', async () => {
    // 1) Sync JSON from whatever is in the textarea (covers manual edits)
    const synced = await syncSettingsFromText();

    if (!synced && !currentSettings) {
      savedStatus.textContent = 'Generate, load, or type instructions first.';
      return;
    }

    const name = presetName.value.trim();
    if (!name) {
      savedStatus.textContent = 'Please enter a name for this setting.';
      return;
    }

    const payload = {
      userId: USER_ID,
      name,
      ...currentSettings,
    };

    try {
      let response;
      let data;

      if (currentSettingId) {
        // UPDATE existing preset
        response = await fetch(`/print-settings/${currentSettingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE new preset
        response = await fetch('/print-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');

      currentSettingId = data._id;
      savedStatus.textContent = 'Preset saved / updated.';
      loadSavedSettings();
    } catch (err) {
      console.error(err);
      savedStatus.textContent = 'Failed to save settings.';
    }
  });

  // ==========================
  // Load Saved Settings
  // ==========================

  async function loadSavedSettings() {
    try {
      const response = await fetch(`/print-settings/${USER_ID}`);
      const data = await response.json();

      savedList.innerHTML = '';

      data.forEach((setting) => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${setting.name}
          <span class="saved-settings-actions">
            <button data-id="${setting._id}" class="display">Display</button>
            <button data-id="${setting._id}" class="apply">Apply</button>
            <button data-id="${setting._id}" class="edit">Edit</button>
            <button data-id="${setting._id}" class="delete">Delete</button>
          </span>
        `;
        savedList.appendChild(li);
      });

      if (!data.length) {
        savedStatus.textContent = 'No presets yet. Create one using Save Settings.';
      }
    } catch (err) {
      console.error(err);
      savedStatus.textContent = 'Failed to load saved settings.';
    }
  }

  // ==========================
  // Apply / Display / Edit / Delete
  // ==========================

  document.addEventListener('click', async (e) => {
    // DISPLAY (read-only)
    if (e.target.classList.contains('display')) {
      const id = e.target.getAttribute('data-id');
      const response = await fetch(`/print-settings/item/${id}`);
      const data = await response.json();

      currentSettings = {
        copies: data.copies,
        color: data.color,
        duplex: data.duplex,
        paperSize: data.paperSize,
        orientation: data.orientation,
      };
      currentSettingId = null; // display is read-only
      presetName.value = data.name || '';

      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      updateInstructionFromSettings();
      status.textContent = 'Displaying saved setting.';
    }

    // APPLY (load and keep live)
    if (e.target.classList.contains('apply')) {
      const id = e.target.getAttribute('data-id');
      const response = await fetch(`/print-settings/item/${id}`);
      const data = await response.json();

      currentSettings = {
        copies: data.copies,
        color: data.color,
        duplex: data.duplex,
        paperSize: data.paperSize,
        orientation: data.orientation,
      };
      currentSettingId = id;
      presetName.value = data.name || '';

      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      updateInstructionFromSettings();
      status.textContent = 'Loaded saved setting.';
    }

    // EDIT (load + mark as editing)
    if (e.target.classList.contains('edit')) {
      const id = e.target.getAttribute('data-id');
      const response = await fetch(`/print-settings/item/${id}`);
      const data = await response.json();

      currentSettings = {
        copies: data.copies,
        color: data.color,
        duplex: data.duplex,
        paperSize: data.paperSize,
        orientation: data.orientation,
      };
      currentSettingId = id;
      presetName.value = data.name || '';

      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      updateInstructionFromSettings();
      status.textContent = 'Editing saved setting. Changes will auto-save or you can press Save Settings.';
      savedStatus.textContent = '';
    }

    // DELETE
    if (e.target.classList.contains('delete')) {
      const id = e.target.getAttribute('data-id');

      try {
        const response = await fetch(`/print-settings/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
          savedStatus.textContent = 'Deleted successfully.';
          if (currentSettingId === id) {
            currentSettingId = null;
          }
          loadSavedSettings();
        } else {
          savedStatus.textContent = data.error || 'Error deleting setting.';
        }
      } catch (err) {
        console.error(err);
        savedStatus.textContent = 'Failed to delete setting.';
      }
    }
  });

  // ==========================
  // Print Demo Modal
  // ==========================

  printButton.addEventListener('click', () => {
    if (!currentSettings) {
      status.textContent = 'Generate or load settings before printing.';
      return;
    }

    printSummary.textContent = JSON.stringify(currentSettings, null, 2);
    printModal.classList.remove('hidden');
  });

  closePrintModal.addEventListener('click', () => {
    printModal.classList.add('hidden');
  });

  confirmPrint.addEventListener('click', () => {
    printModal.classList.add('hidden');
    window.print(); // real browser print dialog
  });

  // Initial load
  loadSavedSettings();
});

// ==========================
// Logout
// ==========================
const logoutButton = document.getElementById("logout-button");
const userLabel = document.getElementById("user-label");

if (currentUser && userLabel) {
  userLabel.textContent = `Logged in as: ${currentUser.username}`;
}

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("printverseUser");
  window.location.href = "login.html";
});
