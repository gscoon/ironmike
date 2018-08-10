import React, {Component} from 'react';

class Start extends Component {
    constructor(props){
        super(props);
        this.state = {
            hostKey     : null,
            authType    : 'password',
            counter     : 0,
            loading     : false,
            panel       : 1,
        }

        this.forms = {
            ssh     : {},
            ports   : {},
        };

        this.ports = {};

        this.customServerKey = '==custom==';

        Util.wait().then(Actions.start.getServers);
    }

    handleHostChange(evt, data){
        var servers = this.props.servers || [];
        var activeHostData = _.find(servers, {title: data.value});
        var authType = (activeHostData && activeHostData.identityFile) ? 'key' : 'password';
        // key status set
        if(authType === 'key')
            activeHostData.isKeySet = 1;

        this.setState({hostKey: data.value, authType: authType})
    }

    handleKeySetStatus(val){
        var servers = this.props.servers || [];
        var activeHostData = _.find(servers, {title: this.state.hostKey});
        activeHostData.isKeySet = val ? 1 : 0;
        this.setState({counter: this.state.counter+1})
    }

    handleAuthChange(evt, data){
        this.setState({authType: data.value})
    }

    componentDidMount(){
        this.doFocus();
    }

    componentDidUpdate(){
        this.doFocus();
    }

    doFocus(){
        if(this.focusable)
            this.focusable.focus();
    }

    checkTunnel(){
        var data = {};
        var self = this;

        self.setState({loading: true});

        _.each(this.forms.ssh, (ele, key)=>{
            data[key] = (ele && ele.state) ? ele.state.value : ele;
        });

        var url = App.getEndpoint('/api/tunnel/check');
        Util.post(url, data)
        .then((response)=>{
            if(!response.status)
                return finished(false);

            finished(true);
        })
        .catch(()=>finished(false));

        function finished(status){
            self.setState({loading: false});
            if(status){
                Actions.start.setActiveServer(data);
                self.setState({panel: 2});
                Toast.success("Connection successful.");
            }
            else {
                Toast.error("An error occurred.");
            }
        }

    }

    setPorts(){
        this.setState({loading: true})

        var data = {
            done : ()=>this.setState({loading: false})
        };

        _.each(this.forms.ports, (ele, key)=>{
            data[key] = (ele && ele.state) ? ele.state.value : ele;
        });

        Actions.start.startApp(data);
    }

    handleFileChange(evt){
        console.log('handleFileChange:', evt.target.files);
    }

    getCustomForm(data){
        data = data || {};

        var fields = {
            host        : null,
            port        : null,
            username    : null,
            password    : null,
        }

        this.forms.ssh.identityFile = data.identityFile;

        _.each(data, (val, key) => {
            fields[key] = val;
        });

        var authField = null;
        if(this.state.authType === 'password'){
            authField = <StartField width={8} type="password" fluid label='Password' placeholder='Password' ref={(r)=>{
                this.forms.ssh.password = r;
                if(Object.keys(data).length) this.focusable = r;
            }} />
        }
        else {
            if(data.isKeySet){
                var keyInput = (
                    <div>
                        <span>{data.identityFile}</span>
                        <br />
                        <label htmlFor="upload" className="key_link">Change</label>
                    </div>
                )
            }
            else {
                var keyInput = <label htmlFor="upload" className="key_link">Select a file</label>
            }

            authField = (
                <UI.Form.Field width={8}>
                    <label htmlFor="upload">Private Key:</label>
                    {keyInput}
                    <input hidden id="upload" type="file" onChange={this.handleFileChange.bind(this)} />
                </UI.Form.Field>
            )
        }

        return (
            <div>
                <UI.Divider clearing />
                <UI.Form.Group>
                    <StartField disabled={!!fields.host}  value={fields.host} label='Host' placeholder='Host' width={11} ref={(r)=>{this.forms.ssh.host = r}} />
                    <StartField disabled={!!fields.port} value={fields.port} label='Port' placeholder='Port' width={5} ref={(r)=>{this.forms.ssh.port = r}} />
                </UI.Form.Group>
                <UI.Divider clearing />
                <UI.Form.Group inline>
                    <label>Auth Type:</label>
                    <UI.Form.Radio
                        label='Password'
                        value='password'
                        checked={this.state.authType === 'password'}
                        onChange={this.handleAuthChange.bind(this)}
                        />
                    <UI.Form.Radio
                        label='Private Key'
                        value='key'
                        checked={this.state.authType === 'key'}
                        onChange={this.handleAuthChange.bind(this)}
                        />
                </UI.Form.Group>
                <UI.Divider clearing />
                <UI.Form.Group widths={"equal"}>
                    <StartField width={8} disabled={!!fields.username} value={fields.username} fluid label='Username' placeholder='Username' ref={(r)=>{this.forms.ssh.username = r}} />
                    {authField}
                </UI.Form.Group>
                <UI.Divider clearing />
                <UI.Button type='submit' content="Continue" onClick={this.checkTunnel.bind(this)} />
            </div>
        )
    }

    getPanel1(){
        var hostOptions = [{
            text : '(New Host)',
            value : this.customServerKey,
        }];

        var servers = this.props.servers || [];
        servers.forEach((s)=>{
            hostOptions.push({text: s.title, value: s.title})
        })

        var bottom = null;
        var activeHostData = _.find(servers, {title: this.state.hostKey});

        if(this.state.hostKey)
            bottom = this.getCustomForm(activeHostData);

        return (
            <UI.Container key="panel-1">
                <UI.Header as='h2'>
                    <UI.Label circular content="1" color="blue" horizontal style={{marginLeft: 0}} />
                    <span>Remote Server</span>
                    <UI.Header.Subheader>Set up your remote server connection</UI.Header.Subheader>
                </UI.Header>
                <UI.Segment id="start_view_inner" loading={this.state.loading}>
                    <UI.Form>
                        <UI.Form.Select width={8} label='Host Selection:' placeholder='Hosts' options={hostOptions} onChange={this.handleHostChange.bind(this)} />
                        {bottom}
                    </UI.Form>
                </UI.Segment>
            </UI.Container>
        );
    }

    getPanel2(){
        return (
            <UI.Container key="panel-2">
                <UI.Header as='h2'>
                    <UI.Label circular content="2" color="blue" horizontal style={{marginLeft: 0}} />
                    <span>Port Handling</span>
                    <UI.Header.Subheader>Set up your local and remote ports</UI.Header.Subheader>
                </UI.Header>
                <UI.Segment id="start_view_inner" loading={this.state.loading}>
                    <UI.Form>
                        <UI.Form.Group>
                            <StartField required type="number" label="Remote Port" placeholder="Port Number" width={4} ref={(r)=>{this.forms.ports.remote = r}} />
                            <StartField type="number" label="App Port" placeholder="Optional" width={4} ref={(r)=>{this.forms.ports.app = r}} />
                        </UI.Form.Group>
                        <UI.Button content="Back" />
                        <UI.Button color="blue" type='submit' content="Start" onClick={this.setPorts.bind(this)} />
                    </UI.Form>
                </UI.Segment>
            </UI.Container>
        );
    }

    render(){
        var panel = null;

        if(this.state.panel === 1)
            panel = this.getPanel1();
        else if(this.state.panel === 2)
            panel = this.getPanel2();

        // <UI.Message warning visible={true} header="SSH Setup" content="Provide your ssh details below:" />
        // <Shared.Steps />
        return (
            <div id="start_view">
                {panel}
            </div>
        );
    }
}

class StartField extends React.Component {
    constructor(props){
        super(props);
        this.state = {value: props.value || ""};
    }

    handleChange(evt, data){
        this.setState({value: data.value});
    }

    focus(){
        this.input.focus();
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.value)
            return {value: nextProps.value};

        return null;
    }

    render(){
        return (
            <UI.Form.Field width={this.props.width} disabled={this.props.disabled} required={!!this.props.required}>
                <label>{this.props.label}:</label>
                <UI.Input type={this.props.type || 'input'} value={this.state.value} onChange={this.handleChange.bind(this)} autoFocus={this.props.autoFocus} ref={(input) => { this.input = input; }} placeholder={this.props.placeholder} />
            </UI.Form.Field>
        );
    }
}

module.exports = Start;
