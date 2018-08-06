import React, {Component} from 'react';
import Reflux from 'reflux';
import ReactDOM from 'react-dom';
import swal from 'sweetalert2';

import { ToastContainer, toast } from 'react-toastify';

// Styling
import 'react-toastify/dist/ReactToastify.css';
import './styles/app.scss';
import './styles/dependencies/grid12.css';
import 'semantic-ui-css/semantic.min.css';

Object.assign(window, {
    Actions     : require('./actions/'),
    AppStore    : require('./store/'),
    Util        : require('./util.js'),
    UI          : require('semantic-ui-react'),
    Modal       : getModal(),
    moment      : require('moment'),
    Toast       : toast,
    I           : require('immutable'),
})

var Dashboard = require('./components/dashboard.jsx');

class App extends Reflux.Component {
    constructor(props){
        super(props);
        this.store = AppStore;
    }

    showLoader(){
        return (
            <UI.Dimmer active>
                <Loader content="Loading" />
            </UI.Dimmer>
        )
    }

    render(){
        return (
            <div id="app_wrapper" className="container">
                <Dashboard requests={this.state.app.get('requests')} />
                <ToastContainer position="top-right" autoClose={2000} />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'))


function getModal(){
    return {
        close : ()=>{
            swal.close();
        },
        error : function(message){
            return swal({
                title   : "An error occorred",
                type    : 'error',
                text    : message,
                timer   : 2500
            })
        },
        showLoader: function(){
            return swal({
                showCancelButton: false,
                showConfirmButton: false,
                onOpen: () => {
                    swal.showLoading()
                }
            });
        },
        hideLoader: function(){
            return swal.close();
        },
        success : function(message){
            return swal({
                type    : "success",
                text    : message,
                timer   : 2500,
            })
        },
        confirm : function(message){
            return swal({
                type    : "warning",
                text    : message,
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText : "Yes!",
            })
            .then(function(results){
                if(results && results.value)
                    return true;

                return Promise.reject(results);
            })
        },
        input   : function(data){
            return swal(Object.assign({
                input: "text",
                confirmButtonText: 'Save',
                showCancelButton: true,
                inputPlaceholder: "Type here",
            }, data))
            .then(function(results){
                if(!results || !results.value)
                    return Promise.reject();

                return results.value;
            })
        }
    }
}
