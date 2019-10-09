import * as React from 'react';
import {useCallback, useContext, useState} from 'react';
import {LinkProps, RouteParams, RouterContextType, RouterProviderType} from './helper';
import {connect, getCurrentPath, getRouteByUrl, getUrlByRoute, navigateByUrl, shouldTrap, usePopState} from './helper';

export const RouterContext = React.createContext<RouterContextType>(null as any);

function useRouterContext() {
    return useContext(RouterContext);
}

/**
 * Return current route, params and pushRoute function
 */
export const useRouter = () => {
    const [path, routes] = useRouterContext();
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
            value: [path, storedRoutes],
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
    const [, routes] = useRouterContext();
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
    return React.createElement('a', {...otherProps, onClick, href: getUrlByRoute(routes, route, params)});
};


export default Router;