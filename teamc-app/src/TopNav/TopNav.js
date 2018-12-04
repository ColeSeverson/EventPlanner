import React, { Component } from 'react';
import moment from 'moment';
import './TopNav.css';
import { makeAPICall } from '../APICalls';

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.loginBtn = this.loginBtn.bind(this);
    }
    loginBtn() {
        //prompt the user for their username
        var name = prompt("Enter your username", "User");
        if (name === null) {
            return -1;
        }
        this.props.updateState({username: name});
        //send the name to the server to get the data
        makeAPICall("post", "retrieve_uid", {friend: name}).then((res) => {
            if(res.data.uid === 0) {
                this.props.updateState({myUid: this.props.uid});
                this.props.updateState({uid: this.props.uid + 1});
            }else{
                this.props.updateState({myUid:res.data.uid})
                //then we retrieve all
                makeAPICall("post", "retrieve_all", {uid: res.data.uid}).then((res2) => {
                    console.log(res2.data);
                    for(var i = 0; i < res2.data.events.length; i++) {
                        res2.data.events[i].start = moment(res2.data.events[i].start, "YYYY-MM-DDTHH:mm:ss");
                        res2.data.events[i].finish = moment(res2.data.events[i].finish, "YYYY-MM-DDTHH:mm:ss");
                    }

                    this.props.friendsList.push(res2.data); 
                    this.props.updateState(this.props.friendsList);
                });
            }
        });
    }
    //returns the JSX for the buttons for the SideBar
    render() {
        return (
            <div className="topNav-div"> 
                <img src={require('./logo.png')} alt="Cesium Logo" />
                <button onClick={this.loginBtn}> Login </button>
            </div>        
        );
    }
}

export default TopNav;
