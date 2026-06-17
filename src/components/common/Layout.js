// src/components/common/Layout.js

import { router, ROUTES } from '../../router.js';

const NAV_ITEMS = [
  {
    section: '포켓몬',
    items: [
      { icon: '🔍', label: '포켓몬 도감', path: ROUTES.POKEMON_LIST },
      { icon: '📊', label: '노력치 분배', path: ROUTES.STAT_POINTS },
    ]
  },
  {
    section: '메타',
    items: [
      { icon: '📈', label: '사용률 통계', path: ROUTES.USAGE_STATS },
      { icon: '⚔️', label: '티어리스트', path: ROUTES.TIER_LIST },
    ]
  },
  {
    section: '팀',
    items: [
      { icon: '🏆', label: '랭킹', path: ROUTES.RANKINGS },
      { icon: '🛠️', label: '팀 빌더', path: ROUTES.TEAM_BUILDER },
    ]
  },
];

export function renderLayout(contentHtml) {
  return `
    <div class="layout-root">
      ${renderHeader()}
      <div class="content-wrapper">
        ${renderSidebar()}
        <main class="main-content" id="page-content">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

function renderHeader() {
  return `
    <header class="site-header">
      <a class="site-logo" href="/" data-link>
        포켓몬<span>챔피언스</span> DB
      </a>
      <div class="header-search">
        <input
          type="search"
          id="global-search"
          placeholder="포켓몬 이름 검색..."
          autocomplete="off"
        />
      </div>
      <nav class="header-nav">
        <a href="${ROUTES.META}"      data-link>메타</a>
        <a href="${ROUTES.TIER_LIST}" data-link>티어</a>
        <a href="${ROUTES.TEAM_BUILDER}" data-link>팀 빌더</a>
        <a href="${ROUTES.ABOUT}"     data-link>정보</a>
      </nav>
    </header>
  `;
}

function renderSidebar() {
  const currentPath = window.location.pathname;

  const sectionsHtml = NAV_ITEMS.map(section => `
    <div class="sidebar-section">
      <div class="sidebar-section-label">${section.section}</div>
      ${section.items.map(item => `
        <a
          class="sidebar-nav-item ${currentPath === item.path ? 'active' : ''}"
          href="${item.path}"
          data-link
        >
          <span class="nav-icon">${item.icon}</span>
          ${item.label}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `
    <aside class="sidebar" id="sidebar">
      ${sectionsHtml}
    </aside>
  `;
}

/** 링크 클릭 이벤트 위임 등록 (앱 초기화 시 1회 호출) */
export function initNavigation() {
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) router.navigate(href);
  });

  // 검색창 엔터
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'global-search') {
      const q = e.target.value.trim();
      if (q) router.navigate(`${ROUTES.POKEMON_LIST}?q=${encodeURIComponent(q)}`);
    }
  });
}

/** 사이드바 active 상태 갱신 */
export function updateSidebarActive(path) {
  document.querySelectorAll('.sidebar-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('href') === path);
  });
  document.querySelectorAll('.header-nav a').forEach(el => {
    el.classList.toggle('active', path.startsWith(el.getAttribute('href')));
  });
}
