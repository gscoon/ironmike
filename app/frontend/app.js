import React, {Component} from 'react';
import Reflux from 'reflux';
import ReactDOM from 'react-dom';
import swal from 'sweetalert2';

Object.assign(window, {
    Actions     : require('./actions/'),
    AppStore    : require('./store/'),
    Util        : require('./util.js'),
    UI          : require('semantic-ui-react'),
    Modal       : getModal(),
    moment      : require('moment'),
})

var Dashboard = require('./components/dashboard.jsx');

class App extends Reflux.Component {
    constructor(props){
        super(props);
        this.store = AppStore;

        Util.wait().then(Actions.dashboard.getRequests);

        Util.waitasec(1)
        .then(()=>{
            setInterval(Actions.dashboard.getLatestRequest, 1000);
        })
    }

    render(){
        return (
            <div id="app_wrapper" className="container">
                <Dashboard requests={this.state.app.get('requests')} />
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
