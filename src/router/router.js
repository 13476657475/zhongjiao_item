import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import Main from '../page/main';
export default function App() {
    return (
        <Router>
            <Switch>
                <Route path="/Scene" component={Main} />
                <Route exact path="/" component={Main} />
            </Switch>
        </Router>
    );
}

