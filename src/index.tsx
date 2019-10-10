import * as React from 'react';
import {useCallback, useContext, useState, useEffect} from 'react';
export type Route = {name: string; path: string; page: React.FunctionComponent};

export const RouterContext = React.createContext<RouterContextType>(null as any);

function useRouterContext() {
    return useContext(RouterContext);
}

/**
 * Return current route, params and pushRoute function
 */
export const useRouter = () => {
    const context = useRouterContext();
    if (!context) throw new Error('Сan\'t find context. Add <Router /> to the root of the project');

    const {path, routes} = context;
    const [route, params] = getRouteByUrl(routes, path);

    const pushRoute = useCallback(
        (routeName: string, params?: RouteParams) => {
            navigateByUrl(getUrlByRoute(routes, routeName, params));
        },
        [routes],
    );

    return {params: params || {}, route: route ? route.name : '', pushRoute};
};

/**
 * Init routing
 * @param props.routes routes config (@see Route)
 * @param props.notFoundPage optional parameter for component Page Not Found
 * @return If there is no route, will return null or notFoundPage
 */
function Router(props: RouterProviderType): any {
    const {routes, notFoundPage} = props;
    const [path, setPath] = useState(getCurrentPath());
    usePopState(path => setPath(path));
    const storedRoutes = connect(routes);

    const [route] = getRouteByUrl(storedRoutes, path);

    if (!route) return notFoundPage || null;

    return React.createElement(
        RouterContext.Provider,
        {
            value: {path, routes: storedRoutes},
        },
        React.createElement(route.page, {}, null),
    );
}

/**
 * Link component for SPA transition
 * @param props.route Route name
 * @param props.params Route params
 */
export const Link: React.FC<LinkProps> = props => {
    const {route, params = {}, ...otherProps} = props;
    const context = useRouterContext();

    if (!context) return null;

    const onClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            try {
                if (props.onClick) props.onClick(e);
            } catch (ex) {
                e.preventDefault();
                throw ex;
            }

            if (shouldTrap(e)) {
                e.preventDefault();

                navigateByUrl(e.currentTarget.href);
            }
        },
        [props],
    );
    return React.createElement('a', {...otherProps, onClick, href: getUrlByRoute(context.routes, route, params)});
};


export type RouteParams = {[key: string]: any};

export type StoreRoute = {
    name: string;
    path: string;
    pattern: string;
    keys?: {[key: string]: number};
    page: React.FunctionComponent;
};

export type StoreRoutes = {[key: string]: StoreRoute};

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    route: string;
    params?: RouteParams;
};

export type RouterContextType = {path: string; routes: StoreRoutes};

export type RouterProviderType = {
    routes: Route[];
    notFoundPage?: React.ReactNode;
};

function toQueryString(params: any) {
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

function objectValues(object: {[key: string]: any}) {
    return Object.keys(object).map(key => object[key]);
}

function connect(routes: Route[]): StoreRoutes {
    const objRoutes: StoreRoutes = {};
    routes.forEach(route => {
        let pattern = route.path;
        const keys: {[key: string]: number} = {};
        pattern = pattern.split('/').join('\\/');
        const matches = pattern.match(/([:*]([a-z][a-z0-9_-]*))/g);
        if (matches)
            matches.forEach((match, index) => {
                pattern = pattern.replace(match, match[0] === ':' ? '([^/]+)' : '(.+)');
                keys[match.substring(1)] = index;
            });

        objRoutes[route.name] = {...route, pattern, keys};
    });

    return objRoutes;
}

function navigateByUrl(url: string) {
    window.history.pushState(null, '', url);
    dispatchEvent(new PopStateEvent('popstate', undefined));
}

function getUrlByRoute(routes: StoreRoutes, routeName: string, params?: RouteParams): string {
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

function getRouteByUrl(routes: StoreRoutes, url: string): [StoreRoute, RouteParams] | [] {
    const [urlPath, queryStrings] = url.split('?');
    const params: RouteParams = {};
    const route = objectValues(routes).find(route => {
        const pattern = new RegExp(`^${route.pattern}$`);
        const matches = urlPath.match(pattern);
        const {keys} = route;
        if (matches) {
            // Params from path
            if (keys) {
                const [, ...paramsValues] = matches;
                paramsValues.forEach((value, index) => {
                    const key = Object.keys(keys).find(key => keys[key] === index);
                    if (key) params[key] = value;
                });
            }

            // Params from search
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

function shouldTrap(e: React.MouseEvent) {
    // @ts-ignore
    return !e.defaultPrevented && e.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function getCurrentPath() {
    return window.location.pathname + window.location.search || '/';
}

function usePopState(setFn: (path: string) => void) {
    useEffect(() => {
        const onPopState = () => {
            setFn(getCurrentPath());
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [setFn]);
}

export default Router;