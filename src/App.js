import React from "react";
// import logo from './logo.svg';
import "./App.css";
import Orders from "./container/Orders";
import { Redirect, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/orders" component={Orders} />
        <Redirect to="/orders" />
      </Switch>
    </div>
  );
}

export default App;
