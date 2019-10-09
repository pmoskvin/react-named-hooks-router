export type RouteParams = {[key: string]: any};

export type StoreRoute = {
    name: string;
    path: string;
    pattern: string;
    keys?: {[key: string]: number};
    page: React.FunctionComponent;
};

export type StoreRoutes = {[key: string]: StoreRoute};

export type Route = {name: string; path: string; page: React.FunctionComponent};

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    route: string;
    params?: RouteParams;
};

export type RouterContextType = [string, StoreRoutes];

export type RouterProviderType = {
    routes: Route[];
    notFoundPage?: React.ReactNode;
};