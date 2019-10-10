import {Route, connect, getUrlByRoute, getRouteByUrl} from "./index";
import * as React from "react";
import * as assert from "power-assert";

const Example1: React.FC = () => {
    return null;
};
const Example2: React.FC = () => {
    return null;
};
const routesMock: Route[] = [{name: 'home', page: Example1, path: '/home/:id'}, {
    name: 'test',
    page: Example1,
    path: '/test/:id/:name'
}];
const storedRoutesMock = {
    home:
        {
            name: 'home',
            page: Example1,
            path: '/home/:id',
            pattern: '\\/home\\/([^/]+)',
            keys: {id: 0}
        },
    test:
        {
            name: 'test',
            page: Example2,
            path: '/test/:id/:name',
            pattern: '\\/test\\/([^/]+)\\/([^/]+)',
            keys: {id: 0, name: 1}
        }
};
const urlMockHomeValid = '/home/1';
const urlMockHomeInValid = '/home/2/4';

const urlMockTestValid = '/test/1/tom';
const urlMockTestInValid1 = '/test/2';
const urlMockTestInValid2 = '/test/2/';
const urlMockTestInValid3 = '/test';


describe('connect', function () {
    const storedRoutes = connect(routesMock);
    it('has route key', function () {
        assert.ok(storedRoutes['home']);
        assert.ok(storedRoutes['test']);
    });

    it('has correct pattern', function () {
        assert.ok(storedRoutes['home'].pattern === storedRoutesMock.home.pattern);
        assert.ok(storedRoutes['test'].pattern === storedRoutesMock.test.pattern);
    });

    it('has correct keys', function () {
        assert.ok(storedRoutes['home'].keys.id === storedRoutesMock.home.keys.id);
        assert.ok(storedRoutes['test'].keys.id === storedRoutesMock.test.keys.id && storedRoutes['test'].keys.name === storedRoutesMock.test.keys.name);
    });
});

describe('getUrlByRoute', function () {
    //console.log(storedRoutesMock.home.pattern, getUrlByRoute(storedRoutesMock, 'home', {id: 1, b: 4}))
    it('valid home', function () {
        assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1}) === urlMockHomeValid);
        assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1, b: 4}) === urlMockHomeValid + '?b=4');
    });
    it('invalid home', function () {
        assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1, b: 4}) !== urlMockHomeInValid);
    });

    it('valid test', function () {
        assert.ok(getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom'}) === urlMockTestValid);
    });

    it('valid test', function () {
        assert.ok(getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom'}) !== urlMockTestInValid1);
    });
});

describe('getRouteByUrl', function () {
    it('valid home', function () {
        assert.ok(getRouteByUrl(storedRoutesMock, urlMockHomeValid)[0].name === 'home');
    });

    it('invalid home', function () {
        assert.ok(!getRouteByUrl(storedRoutesMock, urlMockHomeInValid)[0]);
    });

    it('valid test', function () {
        assert.ok(getRouteByUrl(storedRoutesMock, urlMockTestValid)[0].name === 'test');
    });
    it('invalid test', function () {
        assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid1)[0]);
        assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid2)[0]);
        assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid3)[0]);
    });
});
