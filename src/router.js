// src/router.js
// 심플 해시 기반 SPA 라우터

export const ROUTES = {
  HOME:           '/',
  POKEMON_LIST:   '/pokemon',
  POKEMON_DETAIL: '/pokemon/:id',
  META:           '/meta',
  TIER_LIST:      '/meta/tier',
  USAGE_STATS:    '/meta/usage',
  TEAM_BUILDER:   '/team',
  RANKINGS:       '/rankings',
  STAT_POINTS:    '/stat-points',
  ABOUT:          '/about',
};

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPath = '/';
    this.listeners = [];

    window.addEventListener('popstate', () => this._handleChange());
    window.addEventListener('hashchange', () => this._handleChange());
  }

  register(path, component) {
    this.routes.set(path, component);
    return this;
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this._handleChange();
  }

  _handleChange() {
    this.currentPath = window.location.pathname || '/';
    this.listeners.forEach(fn => fn(this.currentPath));
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  match(path) {
    // 정확 매칭
    if (this.routes.has(path)) {
      return { component: this.routes.get(path), params: {} };
    }

    // 파라미터 매칭 (:id 등)
    for (const [pattern, component] of this.routes) {
      const params = matchPath(pattern, path);
      if (params !== null) {
        return { component, params };
      }
    }

    return null;
  }
}

function matchPath(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export const router = new Router();
