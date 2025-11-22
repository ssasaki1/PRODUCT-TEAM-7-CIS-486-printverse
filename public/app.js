document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('instruction-form');
  const input = document.getElementById('instruction-input');
  const resultPanel = document.getElementById('result');
  const settingsList = document.getElementById('settings-list');
  const rawJsonPre = document.getElementById('raw-json');
  const status = resultPanel.querySelector('.status');

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const s = data.settings;

      settingsList.innerHTML = `
        <li><strong>Copies:</strong> ${s.copies}</li>
        <li><strong>Color mode:</strong> ${s.color}</li>
        <li><strong>Duplex (double-sided):</strong> ${s.duplex ? 'Yes' : 'No'}</li>
        <li><strong>Paper size:</strong> ${s.paperSize}</li>
        <li><strong>Orientation:</strong> ${s.orientation}</li>
      `;

      rawJsonPre.textContent = JSON.stringify(s, null, 2);
      status.textContent = 'Settings generated (simulated).';
    } catch (err) {
      console.error(err);
      status.textContent = `Error: ${err.message}`;
    }
  });
});
