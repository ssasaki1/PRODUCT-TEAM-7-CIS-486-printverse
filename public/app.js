document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('instruction-form');
  const input = document.getElementById('instruction-input');
  const resultPanel = document.getElementById('result');
  const settingsList = document.getElementById('settings-list');
  const rawJsonPre = document.getElementById('raw-json');
  const status = resultPanel.querySelector('.status');
  const saveButton = document.getElementById('save-button');
  const savedList = document.getElementById('saved-settings');

  const USER_ID = "testuser"; // TODO: Replace once login exists

  // ==========================
  // Generate Printer Settings
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

      settingsList.innerHTML = `
        <li><strong>Copies:</strong> ${s.copies}</li>
        <li><strong>Color mode:</strong> ${s.color}</li>
        <li><strong>Duplex:</strong> ${s.duplex ? 'Yes' : 'No'}</li>
        <li><strong>Paper size:</strong> ${s.paperSize}</li>
        <li><strong>Orientation:</strong> ${s.orientation}</li>
      `;

      rawJsonPre.textContent = JSON.stringify(s, null, 2);
      status.textContent = 'Settings generated successfully.';
    } catch (err) {
      console.error(err);
      status.textContent = `Error: ${err.message}`;
    }
  });

  // ==========================
  // Save Settings to DB
  // ==========================
  saveButton.addEventListener('click', async () => {
    const rawSettings = rawJsonPre.textContent;

    if (rawSettings === '{}' || !rawSettings.trim()) {
      alert('Generate settings first.');
      return;
    }

    const parsed = JSON.parse(rawSettings);

    const payload = {
      userId: USER_ID,
      name: `Setting - ${new Date().toLocaleTimeString()}`,
      ...parsed
    };

    try {
      const response = await fetch('/print-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Saved successfully!');
      loadSavedSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save.');
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

      data.forEach(setting => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${setting.name} 
          <button data-id="${setting._id}" class="apply">Apply</button>
          <button data-id="${setting._id}" class="delete">Delete</button>
        `;
        savedList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================
  // Apply & Delete Handler
  // ==========================
  document.addEventListener('click', async (e) => {

    // ▶ APPLY Setting
    if (e.target.classList.contains('apply')) {
      const id = e.target.getAttribute('data-id');

      const response = await fetch(`/print-settings/item/${id}`);
      const data = await response.json();

      settingsList.innerHTML = `
        <li><strong>Copies:</strong> ${data.copies}</li>
        <li><strong>Color mode:</strong> ${data.color}</li>
        <li><strong>Duplex:</strong> ${data.duplex ? 'Yes' : 'No'}</li>
        <li><strong>Paper size:</strong> ${data.paperSize}</li>
        <li><strong>Orientation:</strong> ${data.orientation}</li>
      `;

      rawJsonPre.textContent = JSON.stringify(data, null, 2);
      status.textContent = 'Loaded saved setting.';
    }

    // DELETE Setting
    if (e.target.classList.contains('delete')) {
      const id = e.target.getAttribute('data-id');

      if (!confirm("Delete this saved setting?")) return;

      try {
        const response = await fetch(`/print-settings/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
          alert('Deleted successfully');
          loadSavedSettings();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete');
      }
    }
  });

  // Auto-load saved settings on startup
  loadSavedSettings();
});
