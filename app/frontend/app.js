import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const UI = require('semantic-ui-react');

// main app

class App extends Component {
    constuctor(){

    }

    render(){
        return (
            <div id="app_wrapper" className="container">
                <div id="request_list">
                    <div id="request_list_header" className="row">
                        <div className="col-sm-1">#</div>
                        <div className="col-sm-1">Method</div>
                        <div className="col-sm-1">Code</div>
                        <div className="col-sm-3">Host</div>
                        <div className="col-sm-3">Path</div>
                        <div className="col-sm-1">Mime</div>
                        <div className="col-sm-2">Time</div>
                    </div>
                    <RequestRow />
                    <RequestRow />
                    <RequestRow />
                </div>
            </div>
        );
    }
}

class RequestRow extends Component {

    render(){
        return (
            <div className="row request_list_row">
                <div className="col-sm-1">#</div>
                <div className="col-sm-1">Method</div>
                <div className="col-sm-1">Code</div>
                <div className="col-sm-3">Host</div>
                <div className="col-sm-3">Path</div>
                <div className="col-sm-1">Mime</div>
                <div className="col-sm-2">Time</div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
