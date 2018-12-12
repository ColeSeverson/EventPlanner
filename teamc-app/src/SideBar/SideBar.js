import React, { Component } from 'react';
import moment from 'moment';
import './SideBar.css';
import friend from '../App.js';
import { makeAPICall } from '../APICalls';

class SideBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eid: 0
        }

        //method bindings
        this.importBtn = this.importBtn.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.parseDate = this.parseDate.bind(this);
        this.onFileImport = this.onFileImport.bind(this);
        this.notLoggedIn = this.notLoggedIn.bind(this);
    }

    notLoggedIn() {
        if(this.props.myUid === -1) {
            window.alert("Please log in!");
            return true;
        } else {
            return false;
        }
    }
    /*
     *  Methods to handle the ics uploading
     *  importBtn() just redirects the button click to the file input
     */
    importBtn() {
        if(this.notLoggedIn()) {
            return -1;
        }
        this.refs.fileImport.click();
    }
    /*
     *  Converts the date from an ics format to a react-moment format used by our calendar.js
     */
    parseDate(input) {
        //  var year = input.substr(0,4);
        var month = parseInt(input.substr(4,2), 10) - 1;
        var day = input.substr(6,2);
        var hour = input.substr(9,2);
        var minute = input.substr(11,2);
        //  var second = input.substr(13,2);

        return moment({M:month, d:day, h: hour, m: minute});
    }
    /*
     *  Event listener for the file being uploaded
     */
    onFileImport(e) {
        var file = e.target.files[0];
        var name = prompt("Enter the calendar Title", "unnamed" + (this.props.friendsList.length + 1));
        if(name === null) {
            return -1;
        }
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        //set up the 'friend' with a name, calendar, and uid
        var toAdd = new friend();
        toAdd.friend = name;
        toAdd.events = [];
        toAdd.uid = this.props.uid;
        this.props.updateState({uid: this.props.uid + 1});

        //We use scope to preserve the 'this' pointer inside of the onload function
        const scope = this;
        reader.onload = function (evt) {
            var lines = evt.target.result.split("\n");
            var block = {start:null, finish:null, value:null, eid:null};
            for(var i = 0; i < lines.length; i++) {
                //ie the start of a busy block
                if(lines[i].includes('DTSTART')) {
                    block.start = scope.parseDate(lines[i].split(":")[1]);
                }
                if(lines[i].includes('DTEND')) {
                    block.finish = scope.parseDate(lines[i].split(":")[1]);
                }
                if(lines[i].includes('SUMMARY')) {
                    block.value = lines[i].split(":")[1];
                }
                if(lines[i].includes('END:VEVENT')) {
                    //set the eid and increment it in the state variable
                    block.eid = scope.state.eid;
                    scope.setState({eid: scope.state.eid+1});

                    //then we create a copy by value since JS doesnt do passing dictionaries by value
                    let blockCopy = Object.assign({}, block);
                    toAdd.events.push(blockCopy);
                    block = {};
                }
            }
        }
        const addEvent = { uid: scope.props.myUid, friend: scope.props.username, events: toAdd.events };
        makeAPICall("post", "add_event", addEvent);
        //console.log("event: ", addEvent);
        //now that the 'friend' is processed we can add them to the list
        this.props.friendsList.push(toAdd);
        this.props.updateState(this.props.friendsList);

        reader.onerror = function (error) {
            console.log("error reading file");
        }
    }


    /*
     *  This method handles toggling items in the friends and display list
     *  Adds the elements of the friend to display list or removes them if needed
     */
    toggleItem(item) {
        if(item.displayed) {
            var tempList = this.props.calendarDisplayList.filter(function(it) {
                return !item.events.includes(it);
            });
            this.props.updateState({calendarDisplayList: tempList});    
        }else{
            for(var i = 0; i < item.events.length; i++) {
                this.props.calendarDisplayList.push(item.events[i]);
            }
            this.props.updateState(this.props.calendarDisplayList);    
        }
        item.displayed = !item.displayed;

    }

    removeItem(item) {
        if(item.displayed) {
            this.toggleItem(item);
        }
        var tempList = this.props.friendsList.splice(this.props.friendsList.indexOf(item), 1);
        this.props.updateState({friendList: tempList});
    }

    /*
     *  Generates the CalendarListItem array for the friends list
     */
    createListItems() {
        var items = [];
        for(var item in this.props.friendsList){
            items.push(
                <CalendarListItem key={this.props.friendsList[item].uid + this.props.friendsList[item].friend} value={this.props.friendsList[item]} removeItem={this.removeItem} toggleItem={this.toggleItem}/>  
            );
        }
        return items;
    }

    componentDidMount() {
        /*
         *  get the next event id and user id that we should use
         */
        //makeAPICall("get", "high_eid", null).then(res => this.setState({eid: res.data.uid}));
        //makeAPICall("get", "high_uid", null).then(res => this.props.updateState({uid: res.data.uid}));
    }

    //returns jsx for buttons and list
    render() {
        return (
            <div className='sideBar-div'> 
                <button className="sideBar-importBtn" id="importBtn" onClick={this.importBtn}> import </button>
                <input type="file" id="importInput" ref="fileImport" style={{display: "none"}} onChange={this.onFileImport}/>
                <AddFriends scope={this} className="sideBar-friendsBtn" updateState={this.props.updateState} friendsList={this.props.friendsList}></AddFriends>
                <ul>
                    { this.createListItems() }
                </ul>    
            </div>
        );
    }
}
/*
 *  This component is the 'add friends' button. It changes between a button and a textfield + button 
 */
class AddFriends extends Component{
    constructor(props){
        super(props);
        this.state = {
            addingFriends: false,
            inputValue: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    handleChange(event) {
        this.setState({inputValue: event.target.value});
    }
    //handles the click on the submit button
    handleClick() { 
        //This will have to be replaced with an https request
        //this.props.friendsList.push(this.state.inputValue);
        /*makeAPICall('post', 'retrieve_uid', {friend: this.state.inputValue}).then((res) => {
            if(res.data.uid === 0) {
                window.alert("Friend not found");
                return 0;
            }/*
        /*makeAPICall("post", "retrieve_all", {uid: res.data.uid}).then((res2) => {
                console.log(res2.data);
                for(var i = 0; i < res2.data.events.length; i++) {
                    res2.data.events[i].start = moment(res2.data.events[i].start, "YYYY-MM-DDTHH:mm:ss");
                    res2.data.events[i].finish = moment(res2.data.events[i].finish, "YYYY-MM-DDTHH:mm:ss");
                }

                this.props.friendsList.push(res2.data);
                this.props.updateState(this.props.friendsList);
            });
        });*/

        this.setState({ inputValue:"" });
        this.toggle();
        //this.props.updateState(this.props.friendsList);
    }
    toggle() {
        if(this.props.scope.notLoggedIn()){
            return 0;
        }
        this.setState({ addingFriends: !this.state.addingFriends});
        this.props.updateState(this.props.friendsList);
    }
    //render function for <AddFriends>
    render() {
                if(this.state.addingFriends === true){
                    return(
                        <div>
                            <input onChange={this.handleChange} value={this.state.inputValue} className="sideBar-friendsInput" placeholder="Name"/> <button className="sideBar-friendsSubmitBtn" onClick={this.handleClick}> add </button>
                        </div> 
                    )
                }else{
                    return (
                        <button className="sideBar-friendsBtn" id="friendsBtn" onClick={this.toggle}> add friends </button>
                    )        
                }    
    }
}
/*
 * This component is the List Item with the checkbox and delete button 
 * Its methods are passed in as props so that we can impact the parent component's data
 */
class CalendarListItem extends Component {
    constructor(props){
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }
    handleClick() {
        this.props.toggleItem(this.props.value);
    }
    removeItem() {
        this.props.removeItem(this.props.value);
    }
    render() {
        return (
            <li className="sideBar-listItem">
                {   
                    this.props.value.friend
                }
                <input className="sideBar-listItemCheckBox" type="checkbox" onClick={this.handleClick}/>
                <button className="sideBar-listItemBtn" onClick={this.removeItem}/>
            </li>
        );
    }
}

export default SideBar;
