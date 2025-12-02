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

  const USER_ID = 'testuser'; // for now

  let currentSettings = null;   // current JSON settings (generated / loaded / edited)
  let currentSettingId = null;  // which saved preset (if any) is being edited

  // ==========================
  // Helpers
  // ==========================

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

  // Keep textarea text in sync with currentSettings
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
    if (!currentSettingId || !currentSettings) return;

    try {
      const res = await fetch(`/print-settings/${currentSettingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings),
      });
      await res.json();
      if (res.ok) {
        savedStatus.textContent = 'Saved setting auto-updated.';
        loadSavedSettings();
      } else {
        savedStatus.textContent = 'Failed to update saved setting.';
      }
    } catch (err) {
      console.error(err);
      savedStatus.textContent = 'Error updating saved setting.';
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
    currentSettings = null;
    currentSettingId = null;
    updateChipStates();

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
      currentSettingId = null;
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
    if (!currentSettings) return;

    let changed = false;

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
  // Save Settings to DB
  // ==========================

  saveButton.addEventListener('click', async () => {
    if (!currentSettings) {
      savedStatus.textContent = 'Generate or load settings first.';
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
      const response = await fetch('/print-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');

      savedStatus.textContent = 'Saved successfully.';
      currentSettingId = data._id;
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
    } catch (err) {
      console.error(err);
      savedStatus.textContent = 'Failed to load saved settings.';
    }
  }

  // ==========================
  // Apply / Display / Edit / Delete
  // ==========================

  document.addEventListener('click', async (e) => {
    // DISPLAY
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
      currentSettingId = id;
      presetName.value = data.name || '';

      renderSettings(currentSettings);
      renderRawJson(currentSettings);
      updateChipStates();
      updateInstructionFromSettings();
      status.textContent = 'Displaying saved setting.';
    }

    // APPLY
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

    // EDIT
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
      status.textContent = 'Editing saved setting. Changes will auto-save.';
    }

    // DELETE
    if (e.target.classList.contains('delete')) {
      const id = e.target.getAttribute('data-id');

      try {
        const response = await fetch(`/print-settings/${id}`, { method: 'DELETE' });
        await response.json();

        if (response.ok) {
          savedStatus.textContent = 'Deleted successfully.';
          if (currentSettingId === id) {
            currentSettingId = null;
          }
          loadSavedSettings();
        } else {
          savedStatus.textContent = 'Error deleting setting.';
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
