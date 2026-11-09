// Clear the active session and, where supported, reopen the extension's initial settings popup.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'MPT4_CLEAR_AND_OPEN_SETTINGS') return;
  (async () => {
    try {
      await chrome.storage.session.remove('mpt4Session');
      if (typeof chrome.action?.openPopup !== 'function') {
        sendResponse({ ok: true, opened: false, reason: 'openPopup tidak disokong oleh versi Chrome ini.' });
        return;
      }
      try {
        await chrome.action.openPopup();
        sendResponse({ ok: true, opened: true });
      } catch (error) {
        sendResponse({ ok: true, opened: false, reason: error?.message || String(error) });
      }
    } catch (error) {
      sendResponse({ ok: false, opened: false, error: error?.message || String(error) });
    }
  })();
  return true;
});

// Google Sheets is fetched in the extension service worker, not by the page.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'MPT4_FETCH_SHEET') return;
  (async () => {
    try {
      const url = new URL(message.url);
      if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !url.pathname.includes('/spreadsheets/d/')) {
        throw new Error('URL Google Sheets tidak sah.');
      }
      const response = await fetch(url.href, { credentials: 'omit', redirect: 'follow' });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403
        ? 'ACCESS DENIED: Tetapkan perkongsian kepada Anyone with the link – Viewer.'
        : `Google Sheets gagal dibaca (HTTP ${response.status}).`);
      const csv = await response.text();
      if (/<!doctype html|<html/i.test(csv.slice(0,500))) throw new Error('ACCESS DENIED: Google Sheets tidak boleh dibaca. Tetapkan Anyone with the link – Viewer dan pastikan URL worksheet betul.');
      sendResponse({ ok: true, csv });
    } catch (error) { sendResponse({ ok: false, error: error.message }); }
  })();
  return true;
});
