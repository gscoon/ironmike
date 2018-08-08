import React, {Component} from 'react';

class Start extends Component {
    constructor(props){
        super(props);
        this.state = {
            hostKey     : null,
            authType    : 'password',
            counter     : 0
        }

        this.form = {};
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
        // Actions.start.test()
        var data = {};
        _.each(this.form, (ele, key)=>{
            data[key] = ele.state.value;
        })

        Actions.start.checkTunnel(data);
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

        _.each(data, (val, key) => {
            fields[key] = val;
        });

        var authField = null;
        if(this.state.authType === 'password'){
            authField = <StartField width={8} type="password" fluid label='Password' placeholder='Password' ref={(r)=>{
                this.form.password = r;
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
                <UI.Form.Field fluid width={8}>
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
                    <StartField disabled={!!fields.host}  value={fields.host} fluid label='Host' placeholder='Host' width={11} ref={(r)=>{this.form.host = r}} />
                    <StartField disabled={!!fields.port} value={fields.port} fluid label='Port' placeholder='Port' width={5} ref={(r)=>{this.form.port = r}} />
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
                    <StartField width={8} disabled={!!fields.username} value={fields.username} fluid label='Username' placeholder='Username' ref={(r)=>{this.form.username = r}} />
                    {authField}
                </UI.Form.Group>
                <UI.Divider clearing />
                <UI.Button type='submit' content="Connect" onClick={this.checkTunnel.bind(this)} />
            </div>
        )
    }

    render(){
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

        // <UI.Message warning visible={true} header="SSH Setup" content="Provide your ssh details below:" />
        // <Shared.Steps />
        return (
            <div id="start_view">

                <UI.Container id="start_view_inner">
                    <UI.Form>
                        <UI.Form.Select width={8} label='Host Options:' placeholder='Hosts' options={hostOptions} onChange={this.handleHostChange.bind(this)} />
                        {bottom}
                    </UI.Form>
                </UI.Container>
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
        var type = this.props.type || 'input';
        return (
            <UI.Form.Field width={this.props.width} disabled={this.props.disabled} fluid={this.props.fluid}>
                <label>{this.props.label}:</label>
                <UI.Input type={type} value={this.state.value} onChange={this.handleChange.bind(this)} autoFocus={this.props.autoFocus}  ref={(input) => { this.input = input; }} placeholder={this.props.placeholder} />
            </UI.Form.Field>
        );
    }
}

module.exports = Start;
