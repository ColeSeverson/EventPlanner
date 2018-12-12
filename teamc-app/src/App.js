import React, { Component } from 'react';
import moment from 'moment';
import './App.css';
import SideBar from './SideBar/SideBar';
import TopNav from './TopNav/TopNav';
import Calendar from './Calendar/Calendar';

/*
 *  Friend class is used to hold data on your fiends from either import or backend
 *  contains a uid, name, calendar, and displayed
 *  displayed is wether or not it is in the calendarDisplayList
 *  eslint disable disables the unused warning since this is used by children
 */
/* eslint-disable */
class friend {
    constructor(uid, name, events) {
        this.uid = uid;
        this.friend = name;
        this.events = calendar;
        this.displayed = false;

        return this;
    }
}

//this is the base app that is injected into the index.html
class App extends Component {
    constructor() {
        super();
        this.state = {
            friendsList:[],
            calendarDisplayList:[
                /*    {
                    eid: 1,
                    friend: "cesium",
                    start: moment({d: 28, h: 12, m: 0}),
                    finish: moment({d: 29, h: 13, m: 45}),
                    value: "Frontend Meeting!",
                },
                {
                    eid: 2,
                    friend: "cseve",
                    start: moment({d: 29, h: 10, m: 0}),
                    finish: moment({d: 29, h: 11, m: 45}),
                    value: "cseve",
                },
                { 
                    eid: 3,
                    friend: "sibat",
                    start: moment({d: 29, h: 14, m: 0}),
                    finish: moment({d: 29, h: 16, m: 45}),
                    value: "sibat"
                },
                {
                    eid: 4,
                    friend: "hanna",
                    start: moment({d: 29, h: 10, m: 0}),
                    finish: moment({d: 29, h: 11, m: 15}),
                    value: "hanna",
                    
                },*/
            ],
            myUid: 1,
            uid: 0,
            username: "",
        };
        this.updateState = this.updateState.bind(this);
    }
    updateState(data){
        this.setState(data);
    }
    /*
     * Method passed to children to update state at the top level
     */
    render() {
        return (
            <div className="app-div">
                <SideBar uid={this.state.uid} username = { this.state.username } myUid= { this.state.myUid } friendsList = { this.state.friendsList } updateState = { this.updateState } calendarDisplayList = { this.state.calendarDisplayList }/>
                <TopNav myUid={this.state.myUid} uid = {this.state.uid} friendsList = { this.state.friendsList } username = { this.state.username } myUid = { this.state.myUid } updateState = { this.updateState } />
                <Calendar myUid={this.state.myUid} updateState = {this.updateState} displayList = { this.state.calendarDisplayList } />
            </div>
        );
    }
}

export default App;
