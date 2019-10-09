import { useEffect } from 'react';

export type RouteParams = { [key: string]: any };

export type StoreRoute = {
  name: string;
  path: string;
  pattern: string;
  keys?: { [key: string]: number };
  page: React.FunctionComponent;
};

export type StoreRoutes = { [key: string]: StoreRoute };

export type Route = { name: string; path: string; page: React.FunctionComponent };

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  route: string;
  params?: RouteParams;
};

export type RouterContextType = [string, StoreRoutes];

export type RouterProviderType = {
  routes: Route[];
  notFoundPage?: React.ReactNode;
};

export function toQueryString(params: any) {
  let queryString = '';
  for (const key in params) {
    if ({}.hasOwnProperty.call(params, key) && params[key] != null) {
      if (queryString) {
          queryString += '&';
      }
      const value = params[key];
      queryString += encodeURIComponent(key) + (value === '' ? '' : '=' + encodeURIComponent(value));
    }
  }
  return queryString;
}

function objectValues(object: { [key: string]: any }) {
  return Object.keys(object).map(key => object[key]);
}

export function connect(routes: Route[]): StoreRoutes {
  const objRoutes: StoreRoutes = {};
  routes.forEach(route => {
    let pattern = route.path;
    const keys: { [key: string]: number } = {};
    pattern = pattern.split('/').join('\\/');
    const matches = pattern.match(/([:*]([a-z][a-z0-9_-]*))/g);
    if (matches)
      matches.forEach((match, index) => {
        pattern = pattern.replace(match, match[0] === ':' ? '([^/]+)' : '(.+)');
        keys[match.substring(1)] = index;
      });

    objRoutes[route.name] = { ...route, pattern, keys };
  });

  return objRoutes;
}

export function navigateByUrl(url: string) {
  window.history.pushState(null, '', url);
  dispatchEvent(new PopStateEvent('popstate', undefined));
}

export function getUrlByRoute(routes: StoreRoutes, routeName: string, params?: RouteParams): string {
  const route = routes[routeName];

  if (!route) throw new Error(`Unknown route: '${routeName}'`);

  let url = route.path;
  const queryStringParams: RouteParams = {};
  if (params)
    Object.keys(params).forEach(paramKey => {
      const paramValue = params[paramKey];
      if (route.keys && route.keys[paramKey]) {
        url = url.replace(new RegExp(`[:*]${paramKey}`), paramValue.toString());
      } else {
        queryStringParams[paramKey] = paramValue;
      }
    });

  return url + (Object.keys(queryStringParams).length ? '?' + toQueryString(queryStringParams) : '');
}

export function getRouteByUrl(routes: StoreRoutes, url: string): [StoreRoute, RouteParams] | [] {
  const [urlPath, queryStrings] = url.split('?');
  const params: RouteParams = {};
  const route = objectValues(routes).find(route => {
    const pattern = new RegExp(`^${route.pattern}$`);
    const matches = urlPath.match(pattern);
    const { keys } = route;
    // Если нашли совпадение
    if (matches) {
      // Собираем параметры из path
      if (keys) {
        const [, ...paramsValues] = matches;
        paramsValues.forEach((value, index) => {
          const key = Object.keys(keys).find(key => keys[key] === index);
          if (key) params[key] = value;
        });
      }

      // Собираем queryStrings
      if (queryStrings)
        queryStrings.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          params[key] = value;
        });

      return true;
    }
  });

  if (route) {
    return [route, params];
  }

  return [];
}

export function shouldTrap(e: React.MouseEvent) {
  // @ts-ignore
  return !e.defaultPrevented && e.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function getCurrentPath() {
  return window.location.pathname + window.location.search || '/';
}

export function usePopState(setFn: (path: string) => void) {
  useEffect(() => {
    const onPopState = () => {
      setFn(getCurrentPath());
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setFn]);
}
