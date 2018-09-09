import React, {Component} from 'react';
import ReactJson from 'react-json-view'

class Dashboard extends Component {
    constructor(props){
        super(props);
        // Util.wait().then(Actions.dashboard.getRequests);

        Util.waitasec(1)
        .then(()=>{
            Util.interval(5000, Actions.dashboard.getLatestRequest);
        })

        this.state = {
            activePage  : 1,
            loading     : false,
        }
    }

    handlePageChange(ev, data){
        // console.log(data);
        this.setState({loading: true})
        Util.wait(500)
        .then(()=>{
            this.setState({
                activePage  : data.activePage,
                loading     : false
            });
        })
    }

    disconnect(){
        Actions.dashboard.disconnect();
    }

    render(){
        var appData = this.props.app;
        var requests = appData.requests;
        var chunkSize = 8;
        var chunks = _.chunk(requests, chunkSize);
        var rows = null;

        var chunkIndex = this.state.activePage - 1;

        if(chunks.length)
            rows = chunks[chunkIndex].map((r, index)=>{
                var k = r.id || Util.genID(3);
                return <RequestRow request={r} num={chunkIndex*chunkSize + (index+1)} key={k} />
            });

        var pagi = {
            first       : (this.state.activePage === 1) ? null : '«',
            previous    : (this.state.activePage === 1) ? null : '⟨',
            last        : (this.state.activePage === chunks.length) ? null : '»',
            next        : (this.state.activePage === chunks.length) ? null : '⟩',
        }

        return (
            <div id="dashboard_view">
                <div id="request_list">
                    <UI.Segment id="request_list_header">
                        <div className="row">
                            <div className="col-sm-1">#</div>
                            <div className="col-sm-2">Details</div>
                            <div className="col-sm-2">Time Since</div>
                            <div className="col-sm-1">Method</div>
                            <div className="col-sm-2">Host</div>
                            <div className="col-sm-2">Path</div>
                            <div className="col-sm-1">Resend</div>
                            <div className="col-sm-1">Delete</div>
                        </div>
                    </UI.Segment>
                    <UI.Segment id="request_list_inner" basic className="clean_segment" loading={this.state.loading}>
                        {rows}
                    </UI.Segment>
                    <UI.Pagination
                        firstItem={pagi.first}
                        prevItem={pagi.previous}
                        lastItem={pagi.last}
                        defaultActivePage={this.state.activePage}
                        totalPages={chunks.length}
                        onPageChange={this.handlePageChange.bind(this)}
                        />
                </div>
                <Shared.CurrentSetup button="Disconnect" remote={appData.currentRemote} routes={appData.currentRoutes} onBack={this.disconnect.bind(this)} />
            </div>
        )
    }
}

class RequestRow extends Component {
    constructor(props){
        super(props);
        this.state = {
            counter     : 0,
            showLower   : false,
        };

        // every 10 seconds
        this.interval = Util.interval(10 * 1000, ()=>{
            this.setState({counter: this.state.counter + 1})
        });
    }

    componentWillUnmount(){
        if(this.interval){
            this.interval.clear();
        }
    }

    handleResend(){
        Toast.info("Resending request...");
        Handler.proxy.resend(this.props.request);
    }

    handleDelete(){
        Modal.confirm('Are you sure you want to delete?')
        .then(()=>{
            Actions.dashboard.deleteRequest(this.props.request.id);
        })
    }

    toggleDetails(){
        this.setState({showLower: !this.state.showLower});
    }

    render(){
        var r = this.props.request;
        var ts = r.timestmap || r.timestamp;
        var formattedTime = moment(ts).format('YYYY-MM-DD h:mm:ss a');
        var timeSince = <span>{moment(ts).fromNow()}</span>;
        r.body = r.body || {};
        var id = r.id.slice(-5);

        var lowerStyle = {display: this.state.showLower ? 'block': 'none'};
        var updown = "chevron " + (this.state.showLower ? 'up' : 'down');

        return (
            <UI.Segment className="request_list_row">
                <div className="request_list_row_upper row">
                    <div className="col-sm-1 cell">{this.props.num}.</div>
                    <div className="col-sm-2 cell">
                        <UI.Button size="mini" content="Details" color="blue" icon={updown} onClick={this.toggleDetails.bind(this)} />
                    </div>
                    <div className="col-sm-2 cell">
                        <UI.Popup
                            trigger={timeSince}
                            position="bottom right"
                            content={formattedTime}
                            inverted
                            />
                    </div>
                    <div className="col-sm-1 cell">{r.method}</div>
                    <div className="col-sm-2 cell">{r.hostname}</div>
                    <div className="col-sm-2 cell">{r.path}</div>
                    <div className="col-sm-1 cell">
                        <UI.Button size="mini" icon="send" onClick={this.handleResend.bind(this)} />
                    </div>
                    <div className="col-sm-1 cell">
                        <UI.Button size="mini" icon="trash" onClick={this.handleDelete.bind(this)} />
                    </div>
                </div>
                <UI.Segment className="request_list_row_lower" style={lowerStyle}>
                    <div className="row">
                        <div className="col-sm-6">
                            <PropertiesSection title="Headers" rowID={r.id} properties={r.headers} key="props-headers" />
                        </div>
                        <div className="col-sm-6">
                            <PropertiesSection title="Query" properties={r.query} key="props-query" />
                        </div>
                    </div>
                    <PropertiesSection title="Body" json={r.body} key="props-body" />
                </UI.Segment>
            </UI.Segment>
        )
    }
}

class PropertiesSection extends Component {
    constructor(props){
        super(props);

    }

    getPropertyRow(key, val, index){
        return (
            <div className="property_row" key={key + this.props.rowID}>
                <span className="property_key">{key}:</span>
                <span className="property_val">{val}</span>
            </div>
        )
    }

    render(){
        var inner = null;
        if(this.props.properties){
            var properties = this.props.properties || {};
            inner = Object.keys(properties).map((k, index)=>{
                return this.getPropertyRow(k, properties[k], index);
            });
        }
        else if(this.props.json){
            inner = <ReactJson src={this.props.json} name={null} collapsed={1} displayDataTypes={false} />;
        }

        return (
            <div className="property_section">
                <div className="property_section_title">{this.props.title}:</div>
                <div className="property_section_inner">
                    {inner}
                </div>
            </div>
        )
    }
}

module.exports = Dashboard;
