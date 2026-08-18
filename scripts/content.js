(function() {
  'use strict';

  const BUTTON_CONTAINER_SELECTORS = [
    // Original selector used by the extension
    '.contents.grow.flex-row.flex-wrap.items-center.justify-end',
    // Variants where the container uses flex instead of contents
    '.flex.grow.flex-row.flex-wrap.items-center.justify-end',
    '.flex.grow.flex-row.items-center.justify-end',
    // Any flex row that grows and aligns to the right
    '[class*="grow"][class*="justify-end"]',
    // A toolbar-looking div directly before the leaderboard table
    '#app-main table',
    'main table'
  ];

  // ---------------------------------------------------------------------------
  // Startup
  // ---------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContentScript);
  } else {
    initContentScript();
  }

  function initContentScript() {
    maybeInjectButtons();
    applyStoredLayoutSettings();
    startButtonObserver();
    UrlChangeHandler();
  }

  function applyStoredLayoutSettings() {
    chrome.storage.local.get(["sidebar"]).then((result) => {
      if (result.sidebar === "off" && typeof removeSections === 'function') {
        removeSections();
      }
    });

    chrome.storage.local.get(["style"]).then((result) => {
      if (result.style === "off" && typeof removeStyle === 'function') {
        removeStyle();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Country filter state helpers (legacy, kept for the undo action)
  // ---------------------------------------------------------------------------
  var removedElements = [];

  function restoreRun() {
    removedElements.forEach(function(element) {
      element.style.display = 'table-row';
    });
    removedElements = [];
  }

  // ---------------------------------------------------------------------------
  // Message handling
  // ---------------------------------------------------------------------------
  chrome.runtime.onMessage.addListener(handleMessage);

  function handleMessage(request, sender, sendResponse) {
    const popUpActions = {
      'remove_elements': () => countryFilter(null, null, request.imageFilter),
      'undo_delete': restoreRun,
      'remove_sidebar': removeSections,
      'restore_sidebar': restoreSections,
      'remove_style': removeStyle,
      'restore_style': restoreStyle,
      'get_queue': () => {
        const gameAbbr = getGameAbbr();
        get_queue(gameAbbr, request.queueOptionStart, request.queueOptionEnd);
      }
    };

    const selectedPopUpAction = popUpActions[request.action];
    if (selectedPopUpAction) {
      selectedPopUpAction();
    }
  }

  // ---------------------------------------------------------------------------
  // Game abbreviation extraction
  // ---------------------------------------------------------------------------
  function getGameAbbr() {
    const path = new URL(window.location.href).pathname;
    const parts = path.split("/").filter(Boolean);

    if (parts.length === 0) {
      return null;
    }

    if (parts.length === 1) {
      return parts[0];
    }

    const secondLast = parts[parts.length - 2];
    if (secondLast && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(secondLast)) {
      return parts[parts.length - 1];
    }
    return secondLast;
  }

  // Expose for other content scripts that rely on it
  window.getGameAbbr = getGameAbbr;

  // ---------------------------------------------------------------------------
  // Button injection
  // ---------------------------------------------------------------------------
  function shouldInjectButtons() {
    // Only inject on actual game/leaderboard pages
    const path = new URL(window.location.href).pathname;
    if (path.startsWith('/users/') || path.startsWith('/games') || path === '/' || path === '') {
      return false;
    }
    const abbr = getGameAbbr();
    return !!(abbr && abbr !== 'users' && abbr !== 'games');
  }

  function isInsideAppContent(el) {
    if (!el) return false;
    const appContent = el.closest('#app-main, main');
    return !!appContent && !el.closest('header');
  }

  function findButtonContainer() {
    // Try the explicit toolbar selectors first, but only inside the page content
    for (const selector of BUTTON_CONTAINER_SELECTORS) {
      if (selector === '#app-main table' || selector === 'main table') {
        continue;
      }
      const el = document.querySelector(selector);
      if (el && isInsideAppContent(el)) {
        return el;
      }
    }

    // Fallback: locate a toolbar by walking around the leaderboard table
    const table = findLeaderboardTable();
    if (table && table.parentElement) {
      let candidate = table.parentElement.previousElementSibling;
      while (candidate) {
        if (candidate.tagName && candidate.tagName.toLowerCase() === 'header') {
          break;
        }
        if (candidate.querySelector('button, input, [role="button"]')) {
          return candidate;
        }
        candidate = candidate.previousElementSibling;
      }
    }

    return null;
  }

  function findLeaderboardTable() {
    return document.querySelector('#app-main table, main table');
  }

  function removeExistingButtons() {
    const countryBtn = document.getElementById('regionalFilter');
    const queueBtn = document.getElementById('queueBtn');
    const fallbackBar = document.getElementById('src-plus-buttons');
    if (countryBtn) countryBtn.remove();
    if (queueBtn) queueBtn.remove();
    if (fallbackBar) fallbackBar.remove();
  }

  function maybeInjectButtons() {
    if (!shouldInjectButtons()) {
      removeExistingButtons();
      return;
    }

    if (document.getElementById('regionalFilter')) {
      return;
    }

    const container = findButtonContainer();
    if (container) {
      injectButtonsIntoContainer(container);
      return;
    }

    // Last resort: create a small bar directly above the leaderboard table
    const table = findLeaderboardTable();
    if (table && table.parentNode) {
      injectButtonsAboveTable(table);
    }
  }

  function createButton(id, label, borderColor, color, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = 0;
    button.id = id;
    button.style.border = '2px solid ' + borderColor;
    button.style.color = color;
    button.className = 'x-input-button items-center rounded text-sm px-2.5 py-1.5 bg-input text-on-input border border-around-input hover:bg-input-hover disabled:bg-input w-32';
    const span = document.createElement('span');
    span.textContent = label;
    button.appendChild(span);
    button.addEventListener('click', onClick);
    return button;
  }

  function injectButtonsIntoContainer(container) {
    const countryBtn = createButton('regionalFilter', 'Country Filter', 'gold', 'gold', handleCountryFilterClick);
    const queueBtn = createButton('queueBtn', 'View Queue', 'red', 'red', handleQueueButtonClick);
    container.prepend(queueBtn);
    container.prepend(countryBtn);
  }

  function injectButtonsAboveTable(table) {
    const wrapper = document.createElement('div');
    wrapper.id = 'src-plus-buttons';
    wrapper.className = 'flex flex-row flex-wrap items-center gap-2 mb-2';

    const countryBtn = createButton('regionalFilter', 'Country Filter', 'gold', 'gold', handleCountryFilterClick);
    const queueBtn = createButton('queueBtn', 'View Queue', 'red', 'red', handleQueueButtonClick);

    wrapper.appendChild(countryBtn);
    wrapper.appendChild(queueBtn);
    table.parentNode.insertBefore(wrapper, table);
  }

  function handleCountryFilterClick() {
    const country = prompt("Please enter a Country Code, or leave it blank to reset the leaderboard", "Example: BR, US, CN, GB, PL...");
    if (country == null || country === "" || country === "Example: BR, US, CN, GB, PL...") {
      restoreRun();
    } else {
      restoreRun();
      countryFilter(null, null, country.toLowerCase(), null);
    }
  }

  function handleQueueButtonClick() {
    const gameAbbr = getGameAbbr();
    get_queue(gameAbbr);
  }

  // Keep trying to inject the buttons as the SPA repaints the page
  let injectDebounce = null;
  function startButtonObserver() {
    const target = document.documentElement || document.body;
    if (!target) return;

    const observer = new MutationObserver(function() {
      if (injectDebounce) {
        clearTimeout(injectDebounce);
      }
      injectDebounce = setTimeout(maybeInjectButtons, 300);
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------------
  // Podiums on user pages
  // ---------------------------------------------------------------------------
  function isValidUserPage() {
    const currentURL = window.location.href;
    const userPageRegex = /^https:\/\/www\.speedrun\.com\/users\/[^\/]+(\?view=(fullgame|levels))?$/;
    return userPageRegex.test(currentURL);
  }

  function getFirstWordInTitle() {
    const title = document.title;
    const words = title.split(' ');
    return words[0];
  }

  async function addPodiums() {
    const user = getFirstWordInTitle();

    const removeElement = document.getElementById('podiums');
    if (removeElement) {
      removeElement.remove();
    }

    const podiumHtml = await getPodiums(user);
    if (!podiumHtml) return;

    const podiumTargetDiv = document.querySelector('.relative.flex.w-full.min-w-0.flex-none.flex-col.flex-nowrap.gap-y-4.lg\\:w-auto.lg\\:flex-auto.lg\\:shrink');
    if (podiumTargetDiv) {
      const podiumElement = document.createRange().createContextualFragment(podiumHtml);
      podiumTargetDiv.insertBefore(podiumElement, podiumTargetDiv.firstChild);
    }
  }

  function UrlChangeHandler() {
    if (isValidUserPage()) {
      addPodiums();
    } else {
      const removeElement = document.getElementById('podiums');
      if (removeElement) {
        removeElement.remove();
      }
    }
  }

  let lastUrl = location.href;
  const urlObserver = new MutationObserver(function() {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      UrlChangeHandler();
      maybeInjectButtons();
    }
  });
  urlObserver.observe(document, { childList: true, subtree: true });
})();
