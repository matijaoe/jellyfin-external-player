// ==UserScript==
// @name         Jellyfin → Open in IINA
// @namespace    https://matijao.com
// @version      0.1.0
// @description  Adds an "Open in IINA" button to Jellyfin item detail pages
// @match        *://*/web/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Only run on Jellyfin
  if (!document.querySelector('meta[name="application-name"][content="Jellyfin"]')) return;

  const BTN_ID = 'btnOpenInIINA';

  const getItemId = () => {
    const m = location.hash.match(/[?&]id=([a-f0-9]{32})/i);
    return m ? m[1] : null;
  };

  const buildUrl = () => {
    const api = window.ApiClient;
    if (!api) return null;
    const id = getItemId();
    if (!id) return null;
    return api.getUrl(`Items/${id}/Download`, { api_key: api.accessToken() });
  };

  const openInIINA = () => {
    const url = buildUrl();
    if (!url) { console.warn('[IINA] no item id / ApiClient'); return; }
    location.href = 'iina://weblink?url=' + encodeURIComponent(url);
  };

  const makeButton = () => {
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.title = 'Open in IINA';
    btn.className = 'button-flat detailButton emby-button';
    btn.innerHTML =
      '<div class="detailButton-content">' +
        '<span class="material-icons detailButton-icon launch" aria-hidden="true"></span>' +
      '</div>';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openInIINA();
    });
    return btn;
  };

  const inject = () => {
    document.querySelectorAll('.mainDetailButtons').forEach((row) => {
      if (row.querySelector('#' + BTN_ID)) return;
      const anchor = row.querySelector('.btnPlaystate');
      const btn = makeButton();
      anchor ? row.insertBefore(btn, anchor) : row.appendChild(btn);
    });
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; inject(); });
  };

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(inject, 100));
  inject();
})();
