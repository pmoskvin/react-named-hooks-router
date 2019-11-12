import {Route, connect, getUrlByRoute, getRouteByUrl} from './index';
import * as React from 'react';
import * as assert from 'power-assert';

const Example1: React.FC = () => {
	return null;
};
const Example2: React.FC = () => {
	return null;
};
const Example3: React.FC = () => {
	return null;
};
const routesMock: Route[] = [
	{name: 'home', page: Example1, path: '/home/:id'},
	{name: 'test', page: Example2, path: '/test/:id/:name'},
	{name: 'user', page: Example3, path: '/user/*id/:name'},
];
const storedRoutesMock = {
	home: {
		name: 'home',
		page: Example1,
		path: '/home/:id',
		pattern: '\\/home\\/([^/]+)',
		keys: {id: 0},
	},
	test: {
		name: 'test',
		page: Example2,
		path: '/test/:id/:name',
		pattern: '\\/test\\/([^/]+)\\/([^/]+)',
		keys: {id: 0, name: 1},
	},
	user: {
		name: 'user',
		page: Example3,
		path: '/user/*id/:name',
		pattern: '\\/user\\/(.+?)\\/([^/]+)',
		keys: {id: 0, name: 1},
	},
};
const urlMockHomeValid = '/home/1';
const urlMockHomeInValid = '/home/2/4';

const urlMockTestValid = '/test/1/tom';
const urlMockTestInValid1 = '/test/2';
const urlMockTestInValid2 = '/test/2/';
const urlMockTestInValid3 = '/test';
const urlMockTestInValid4 = '/test/1/tom?a=1';
const urlMockTestInValid5 = '/test/1/tom?a.b.r=2&a.c=1';
const urlMockTestInValid6 = '/test/1/tom?a.0.r=2&a.1=1';

describe('connect', function() {
	const storedRoutes = connect(routesMock);
	it('correct routes count', function() {
		assert.ok(Object.keys(storedRoutes).length === routesMock.length);
	});

	it('has route key', function() {
		assert.ok(storedRoutes['home']);
		assert.ok(storedRoutes['test']);
	});

	it('has correct pattern', function() {
		assert.ok(storedRoutes['home'].pattern === storedRoutesMock.home.pattern);
		assert.ok(storedRoutes['test'].pattern === storedRoutesMock.test.pattern);
	});

	it('has correct keys', function() {
		assert.ok(storedRoutes['home'].keys && storedRoutes['home'].keys.id === storedRoutesMock.home.keys.id);
		assert.ok(
			storedRoutes['test'].keys &&
				storedRoutesMock.test.keys &&
				storedRoutes['test'].keys.id === storedRoutesMock.test.keys.id &&
				storedRoutes['test'].keys.name === storedRoutesMock.test.keys.name,
		);
	});
});

describe('getUrlByRoute', function() {
	it('valid home', function() {
		assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1}) === urlMockHomeValid);
		assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1, b: 4}) === urlMockHomeValid + '?b=4');
	});
	it('invalid home', function() {
		assert.ok(getUrlByRoute(storedRoutesMock, 'home', {id: 1, b: 4}) !== urlMockHomeInValid);
	});

	it('valid test', function() {
		assert.ok(getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom'}) === urlMockTestValid);
	});

	it('valid test', function() {
		assert.ok(getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom'}) !== urlMockTestInValid1);
	});

	it('valid test query string', function() {
		assert.ok(getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom', a: 1}) === urlMockTestInValid4);
	});

	it('valid test query string deep', function() {
		assert.ok(
			getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom', a: {b: {r: 2}, c: 1}}) === urlMockTestInValid5,
		);
	});

	it('valid test query string deep array', function() {
		assert.ok(
			getUrlByRoute(storedRoutesMock, 'test', {id: 1, name: 'tom', a: [{r: 2}, 1]}) === urlMockTestInValid6,
		);
	});
});

describe('getRouteByUrl', function() {
	it('valid home', function() {
		const route = getRouteByUrl(storedRoutesMock, urlMockHomeValid)[0];
		assert.ok(route && route.name === 'home');
	});

	it('invalid home', function() {
		assert.ok(!getRouteByUrl(storedRoutesMock, urlMockHomeInValid)[0]);
	});

	it('valid test', function() {
		const route = getRouteByUrl(storedRoutesMock, urlMockTestValid)[0];
		assert.ok(route && route.name === 'test');
	});
	it('invalid test', function() {
		assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid1)[0]);
		assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid2)[0]);
		assert.ok(!getRouteByUrl(storedRoutesMock, urlMockTestInValid3)[0]);
	});

	it('valid user', function() {
		const route = getRouteByUrl(storedRoutesMock, '/user/rrr/234');
		assert.ok(route[0] && route[0].name === 'user');
		assert.ok(route[1] && route[1].id === 'rrr');
		assert.ok(route[1] && route[1].name === '234');
	});

	it('query strings', function() {
		const route = getRouteByUrl(storedRoutesMock, '/user/rrr/234?a=1');
		assert.ok(route[1] && route[1].a === '1');
	});

	it('query strings deep', function() {
		const route = getRouteByUrl(storedRoutesMock, '/user/rrr/234?a.b.c=1');
		assert.ok(route[1] && route[1].a.b.c === '1');
	});

	it('query strings deep array', function() {
		const route = getRouteByUrl(storedRoutesMock, '/user/rrr/234?a.0.c=1&a.1.c=3');
		assert.ok(route[1] && route[1].a[0].c === '1');
	});
});
