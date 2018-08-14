import React, {Component} from 'react';

class CurrentSetup extends Component {
    constructor(props){
        super(props);
    }

    back(){
        if(this.props.onBack)
            this.props.onBack();
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

        var buttonText = this.props.button || "Change";

        return (
            <div id="request_setup">
                <div className="row">
                    <div className="col-sm-3">
                        <b>Host:</b><br />
                        {remote.host}
                    </div>
                    <div className="col-sm-3">
                        <b>Remote Port:</b><br />
                        {tunnelRoute.remotePort}
                    </div>
                    <div className="col-sm-3">
                        <b>App Route:</b><br />
                        {appDest}
                    </div>
                    <div className="col-sm-3 flex_center">
                        <UI.Button size="mini" content={buttonText} color="red" onClick={this.back.bind(this)} />
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = CurrentSetup;
