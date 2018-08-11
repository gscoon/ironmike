import React, {Component} from 'react';

const Path = require('path');

class Header extends Component {
    constructor(props){
        super(props);
        this.state = {
            sidebarVisible  : false,
            headerUpdated   : 0,
        }
    }

    toggleSidebar(direction){
        if(direction !== true && direction !== false)
            direction = !this.state.sidebarVisible;

        this.setState({sidebarVisible: direction})
    }

    update(){
        this.setState({headerUpdated: (this.state.headerUpdated + 1)})
    }

    minimize(){
        Main.minimize();
        this.update();
    }

    maximize(){
        Main.maximize();
        this.update();
    }

    hideWindow(){
        Main.hideWindow();
        this.update();
    }

    unmaximize(){
        Main.unmaximize();
        this.update();
    }

    render(){
        var logoSrc = Path.join(Main.rootDir, "./frontend/assets/images/brand/iron.png");

        if(Main.isMaximized())
            var maxEle = <a data-control="unmax" className="window-control" onClick={this.unmaximize.bind(this)}></a>
        else
            var maxEle = (<a data-control="max" className="window-control" onClick={this.maximize.bind(this)}></a>)

        return (
            <div id="header_wrapper">
                <div id="header">
                    <UI.Menu id="app_sidebar_button" className="nondraggable" floated={true} inverted={true}>
                        <UI.Menu.Item icon="sidebar" onClick={this.toggleSidebar.bind(this)} />
                    </UI.Menu>
                    <div className="title">IronMike</div>
                    <div id="window-controls">
                        <a data-control="min" className="window-control" onClick={this.minimize.bind(this)}></a>
                        {maxEle}
                        <a data-control="close" className="window-control" onClick={this.hideWindow.bind(this)}></a>
                    </div>
                    <div className="edge" id="edge-left" />
                    <div className="edge" id="edge-right" />
                    <div className="edge" id="edge-top" />
                </div>
                <UI.Sidebar id="app_sidebar" className="nondraggable" as={UI.Menu} animation='overlay' inverted vertical visible={this.state.sidebarVisible} width="thin">
                </UI.Sidebar>
            </div>
        );
    }
}

module.exports = Header;
