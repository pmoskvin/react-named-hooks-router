# react-named-hooks-router
[![Build Status](https://travis-ci.org/pmoskvin/react-named-hooks-router.svg?branch=master)](https://travis-ci.org/pmoskvin/react-named-hooks-router)
[![dependencies Status](https://david-dm.org/pmoskvin/react-named-hooks-router/status.svg)](https://david-dm.org/pmoskvin/react-named-hooks-router)
[![MIT License](https://img.shields.io/npm/l/react-named-hooks-router.svg)](https://github.com/pmoskvin/react-named-hooks-router/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/react-named-hooks-router.svg)](https://www.npmjs.com/package/react-named-hooks-router)
[![NPM Downloads](https://img.shields.io/npm/dm/react-named-hooks-router.svg?style=flat)](https://npmcharts.com/compare/react-named-hooks-router?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=react-named-hooks-router)](https://packagephobia.now.sh/result?p=react-named-hooks-router)

**react-named-hooks-router** is as simple react router with hooks and named routes.

* No need to write the url, just the name of the route
* At any time you can get a full description of the current route with all params
* pushRoute method for programmatic navigation
* beforeUnload event with resolve function
* Full typescript support

## Usage

index.tsx
```tsx
import { Router } from 'react-named-hooks-router';
import NotFoundPage from 'components/NotFoundPage';
import HomePage from 'components/HomePage';
import UserPage from 'components/UserPage';
import PhotosPage from 'components/PhotosPage';

const routes = [
    {name: 'home', path: '/', page: HomePage},
    {name: 'user', path: '/user/:id', page: UserPage}, // dynamic segment
    {name: 'photos', path: '/photos/*path', page: PhotosPage}, // wildcard segment
];

const handleLoadPage = (routeName: string) => {
    console.log(routeName + 'is loaded!');
}

ReactDOM.render(<Router routes={routes} notFoundPage={<NotFoundPage />} onLoadPage={handleLoadPage} />, document.getElementById('root'));
```

UserPage.tsx
```tsx
import {useRouter, Link} from 'react-named-hooks-router';

const UserPage = () => {
    // First parameter is onBeforeUnload
    const [test, setTest] = useState(false);
    const [navigateCallback, setNavigateCallback] = useState();
    const handleBeforeUnload = useCallabck(navigate => {
        if (test) navigate();
        else setNavigateCallback(() => navigate);        
    }, [test]);
    
    // Generic for routeParams
    // Callback for beforeUnload effect
    const {routeName, routeParams, pushRoute, urlByRoute} = useRouter<{id: number}>(handleBeforeUnload);

    console.log(urlByRoute(routeName, routeParams)); // Log path

    return (
        <div>
            <p>This is {routeName} {routeParams.id}</p>
            <Link route="user" params={{id: 2}}>User 2</Link>
            {/* Query string parameters as deep objects */}
            <Link route="user" params={{id: 2, user: {name: 'Bob', data: {age: 3, login: 'bob35'}}}}>User 2</Link> {/* Resolve to /user/2?user.name=Bob&user.data.age=3&user.data.login=bob35 */}
            <button type="button" onClick={() => pushRoute('home')}>Home Page</button>
            <ModalPopup open={!!setNavigateCallback}>Leave page?<br /><button type="button" onClick={() => navigateCallback()}>Yes!</button></ModalPopup>
        </div>
    );
};

export default UserPage;
```
