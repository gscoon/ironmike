import React, {Component} from 'react';

class CurrentSetup extends Component {
    constructor(props){
        super(props);
    }

    render(){
        var appDest = "n/a";
        var proxyRoutes = this.props.routes.proxy;
        if(proxyRoutes.routes){
            var proxyRoute = proxyRoutes.routes[0];
            if(proxyRoute)
                appDest = proxyRoute.destination
        }

        var tunnelRoute = this.props.routes.tunnel;
        var remote = this.props.remote;

        return (
            <div id="request_setup" color='grey'>
                <div className="row">
                    <div className="col-sm-3"><b>Host:</b> {remote.host}</div>
                    <div className="col-sm-3"><b>Remote Port:</b> {tunnelRoute.remotePort}</div>
                    <div className="col-sm-3"><b>App Route:</b> {appDest}</div>
                    <div className="col-sm-3">Change</div>
                </div>
            </div>
        )
    }
}

module.exports = CurrentSetup;
