[![MIT License](https://img.shields.io/npm/l/react-named-hooks-router.svg)](https://github.com/pmoskvin/react-named-hooks-router/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/react-named-hooks-router.svg)](https://www.npmjs.com/package/react-named-hooks-router)

**react-named-hooks-router** is as simple react router with hooks and named routes.

* No need to write the url, just the name of the route
* At any time you can get a full description of the current route with all params
* pushRoute method for programmatic navigation
* Full typescript support

## Usage

index.tsx
```tsx
import { Router } from 'react-named-hooks-router';
import NotFoundPage from 'components/NotFoundPage';
import HomePage from 'components/HomePage';
import UserPage from 'components/UserPage';

const routes = [
    {name: 'home', path: '/', page: HomePage},
    {name: 'user', path: '/user/:id', page: UserPage}
];

ReactDOM.render(<Router routes={routes} notFoundPage={<NotFoundPage />} />, document.getElementById('root'));
```

UserPage.tsx
```tsx
import {useRouter, Link} from 'react-named-hooks-router';

const UserPage = () => {
    const {route, params, pushRoute} = useRouter();

    return (
        <div>
            <p>This is {route} {params.id}</p>
            <Link route="user" params={{id: 2}}>User 2</Link>
            <button type="button" onClick={() => pushRoute('home')}>Home Page</button>
        </div>
    );
};

export default UserPage;
```
