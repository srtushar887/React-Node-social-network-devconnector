import React,{Fragment, useEffect} from "react";
import {BrowserRouter as Router,Route,Switch} from "react-router-dom";

//redux
import {Provider} from "react-redux";
import store from "./store";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Alert from "./components/layout/alert";
import './App.css';
import setAuthToken from "./utils/setAuthToken";
import {loadUser} from "./actions/auth";




if (localStorage.token){
    setAuthToken(localStorage.token);
}


const App =()=> {

    useEffect(() =>{
       store.dispatch(loadUser());
    },[]);


    return (
    <Provider store={store}>
        <Router>
            <Fragment>
                <Navbar/>
                <Route exact path="/" component={Landing}></Route>
                <section className="container">
                    <Alert/>
                    <Switch>
                        <Route exact path="/register" component={Register}></Route>
                        <Route exact path="/Login" component={Login}></Route>
                    </Switch>
                </section>
            </Fragment>
        </Router>
    </Provider>
)}

export default App;
