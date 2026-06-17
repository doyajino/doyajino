// src/main.js
// 앱 진입점 — 라우팅 초기화

import { router, ROUTES } from './router.js';
import { renderLayout, initNavigation, updateSidebarActive } from './components/common/Layout.js';
import {
  renderHomePage,
  renderPokemonListPage,
  renderPokemonDetailPage,
  renderUsageStatsPage,
  renderTierListPage,
  renderTeamBuilderPage,
  renderAboutPage,
} from './pages/index.js';

// =====================
// 페이지 등록
// =====================
const PAGE_MAP = {
  [ROUTES.HOME]:          { render: renderHomePage,       title: '홈' },
  [ROUTES.POKEMON_LIST]:  { render: renderPokemonListPage, title: '포켓몬 도감' },
  [ROUTES.POKEMON_DETAIL]:{ render: renderPokemonDetailPage, title: '포켓몬 상세' },
  [ROUTES.USAGE_STATS]:   { render: renderUsageStatsPage, title: '사용률 통계' },
  [ROUTES.TIER_LIST]:     { render: renderTierListPage,   title: '티어리스트' },
  [ROUTES.META]:          { render: renderUsageStatsPage, title: '메타' },
  [ROUTES.TEAM_BUILDER]:  { render: renderTeamBuilderPage, title: '팀 빌더' },
  [ROUTES.RANKINGS]:      { render: renderUsageStatsPage, title: '랭킹' },
  [ROUTES.STAT_POINTS]:   { render: renderPokemonListPage, title: '노력치 분배' },
  [ROUTES.ABOUT]:         { render: renderAboutPage,      title: '정보' },
};

// =====================
// 앱 초기화
// =====================
async function init() {
  const app = document.getElementById('app');

  // 초기 레이아웃 (로딩 상태)
  app.innerHTML = renderLayout(`
    <div class="skeleton" style="height:200px; margin-bottom:16px;"></div>
    <div class="skeleton" style="height:120px; margin-bottom:12px;"></div>
    <div class="skeleton" style="height:120px;"></div>
  `);

  // 링크 클릭 이벤트 등록
  initNavigation();

  // 라우트 변경 리스너
  router.onChange(path => loadPage(path));

  // 현재 경로로 첫 페이지 로드
  await loadPage(window.location.pathname || '/');
}

// =====================
// 페이지 로드
// =====================
async function loadPage(path) {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) {
    // 레이아웃 자체가 없으면 전체 재렌더
    const app = document.getElementById('app');
    app.innerHTML = renderLayout('');
    initNavigation();
  }

  // 사이드바 active 갱신
  updateSidebarActive(path);

  // 매칭
  const matched = matchRoute(path);

  const contentEl = document.getElementById('page-content');

  // 로딩 표시
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="skeleton" style="height:48px; width:300px; margin-bottom:12px;"></div>
      <div class="skeleton" style="height:200px; margin-bottom:12px;"></div>
      <div class="skeleton" style="height:160px;"></div>
    `;
  }

  try {
    const html = await matched.render(matched.params);
    if (contentEl) {
      contentEl.innerHTML = html;
      document.title = `${matched.title} — 포켓몬챔피언스 DB`;

      // 탭 이벤트 바인딩
      bindTabEvents(contentEl);
      // 포켓몬 필터 바인딩
      bindPokemonFilter(contentEl);
    }
  } catch (err) {
    console.error('Page render error:', err);
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>페이지를 불러오는 중 오류가 발생했습니다.</p>
          <p style="font-size:0.8rem; margin-top:8px; color:var(--color-text-muted);">${err.message}</p>
        </div>
      `;
    }
  }

  // 스크롤 상단 이동
  window.scrollTo(0, 0);
}

function matchRoute(path) {
  // 정확 매칭
  if (PAGE_MAP[path]) return { ...PAGE_MAP[path], params: {} };

  // 파라미터 패턴 매칭
  for (const [pattern, page] of Object.entries(PAGE_MAP)) {
    const params = matchPathParams(pattern, path);
    if (params !== null) return { ...page, params };
  }

  // 404 fallback
  return {
    render: async () => `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <p>페이지를 찾을 수 없습니다: <code>${path}</code></p>
        <a href="/" data-link class="btn btn-secondary" style="margin-top:16px;">홈으로</a>
      </div>
    `,
    title: '404',
    params: {},
  };
}

function matchPathParams(pattern, path) {
  const pp = pattern.split('/');
  const pa = path.split('/');
  if (pp.length !== pa.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = pa[i];
    else if (pp[i] !== pa[i]) return null;
  }
  return params;
}

// =====================
// 탭 이벤트 바인딩
// =====================
function bindTabEvents(root) {
  const tabBtns = root.querySelectorAll('.tab-btn');
  const tabPanels = root.querySelectorAll('[data-tab-panel]');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabPanels.forEach(p => {
        p.style.display = p.dataset.tabPanel === idx ? '' : 'none';
      });
    });
  });

  // 첫 번째 탭 외 숨기기
  tabPanels.forEach((p, i) => { if (i > 0) p.style.display = 'none'; });
}

// =====================
// 포켓몬 필터 바인딩
// =====================
function bindPokemonFilter(root) {
  const filterInput = root.querySelector('#pokemon-filter');
  const typeSelect  = root.querySelector('#type-filter');
  const grid        = root.querySelector('#pokemon-grid');
  if (!filterInput || !grid) return;

  function applyFilter() {
    const q    = filterInput.value.toLowerCase();
    const type = typeSelect?.value || '';
    grid.querySelectorAll('.pokemon-card').forEach(card => {
      const name   = card.querySelector('.pokemon-name')?.textContent.toLowerCase() || '';
      const badges = [...card.querySelectorAll('.type-badge')].map(b => b.className.replace('type-badge ', '').trim());
      const nameMatch = !q || name.includes(q);
      const typeMatch = !type || badges.includes(type);
      card.style.display = nameMatch && typeMatch ? '' : 'none';
    });
  }

  filterInput.addEventListener('input', applyFilter);
  typeSelect?.addEventListener('change', applyFilter);
}

// =====================
// 시작
// =====================
init().catch(console.error);
