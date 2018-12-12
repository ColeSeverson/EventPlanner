import React, { Component } from 'react';
import moment from 'moment';
import fileDownload from 'js-file-download';
import './Calendar.css';


class Calendar extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            start: 8,
            end: 20,
            date: moment(),
            zlevel: 10,
            buffer: [],

            //These are for the form
            selected: moment(),
            exporting: false,
            input: '',
            length: 0
        }

        this.createListElements = this.createListElements.bind(this);
        this.renderColumns = this.renderColumns.bind(this);
        this.renderHours = this.renderHours.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.notLoggedIn = this.notLoggedIn.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.exportBtn = this.exportBtn.bind(this);
        this.cancelBtn = this.cancelBtn.bind(this);
        this.handleNumberChange = this.handleNumberChange.bind(this);
    }
    notLoggedIn() {
        if(this.props.myUid === -1) {
            window.alert("Please Log In!");
            return true;
        }else {
            return false;
        }
    }
    createListElements(){
        var list = [];
        for(var i = 0; i < this.props.displayList.length; i++){
            let temp = this.props.displayList[i];
            list.push(
                <li key={i}> { temp.value + ", " + i } </li>
            );
        }
        return list;
    }
    /*
     *  Renders the 7 columns for the 7 next days in the weel
     */
    renderColumns() {  
        //first get the current date
        let currentDate = moment();
        var buffer = this.props.displayList.slice();
        //.add(2, 'd');
        var cols = [];
        for(let i = 0; i < 7; i++) {
            let blocks = [];
            for(let i = 0; i < buffer.length; i++) {
                if(buffer[i].start.format("MM DD") ===
                    currentDate.format("MM DD")) {
                        blocks.push(buffer[i]);
                    }
            }

            cols.push(
                <div id={"col" + i} key={currentDate.format('dddd')} className="calendar-column">
                    <h1> { currentDate.format('dddd') } </h1>
                    { this.renderHours(currentDate, blocks, buffer) }
                </div>
            );
            currentDate = currentDate.add(1, 'd');
        }
        return cols;

     }

    /*
     * Handle a click on one of the numbers
     */
    handleClick(e, data) {
        if(this.notLoggedIn()){
            return 0;
        }
        if(data == null) {
            return 0;
        }
        this.setState({selected: data});
        this.setState({exporting: true});
    }
    /*
     *  Used by renderColumns, renders the hour selections
     *  the cless are rendered as 'calendar-busy' if the time is reserved
     */
    renderHours(currentDate, blocks, buffer) {
        var hours = [];
        var hourHeight = 95 / (this.state.end - this.state.start) + "%";
    

        for(let i = this.state.start; i < this.state.end; i++) {
            let toDisplay = (i > 11 ? (i === 12 ? 12 : i % 12) + "PM" : i + "AM");
            let toPass = i;

            //here we do the logic to figure out if it is busy or not
            let hourStyle = {
                'height':hourHeight
            }
            let hourClass = "calendar-hour";
            /*
             *  If the hour falls in a block we make it blue
             *  IF it is an overnight event we currently will not deal with it, it will just go to the end of the current day
             */

            for(let j = 0; j < blocks.length; j++) {
                let overnight = false;
                //console.log(blocks[j]);
                if(blocks[j].finish.format("D") > currentDate.format("D")) {
                    var newBlock = {
                        start: moment().set({'day':currentDate.get('day') + 1,
                            'hour':1}),
                        finish: blocks[j].finish
                    }
                    buffer.push(newBlock);
                    overnight = true;
                }       
                
                if(i >= blocks[j].start.format("H") &&
                    (i <= blocks[j].finish.format("H") || overnight)) {
                    hourClass = "calendar-busy";
                }
            }
            let toSend = currentDate.clone();
            toSend = toSend.set({'hour':toPass, 'minute':0, 'seconds':0});
            hours.push(
                <div key={currentDate.format('dddd') + i} style={hourStyle} className={hourClass} onClick={((e) => this.handleClick(e, toSend))}>
                    { toDisplay }

                </div>
                );
        }
        return hours;
    }

    /*
     *All of the code for the export form is after this
     *
    */
    renderForm() {
        if(this.state.exporting) {
            return (
                <div className="calendar-formDiv">
                    <h1> Export your event! </h1>
                    <h2> Start Time: { this.state.selected.format("hA") } </h2>
                    <input className="calendar-nameField" type="text" placeholder="Title" onChange={(e) => {this.handleChange(e)}}/>
                    <input className="calendar-lengthField" type="text" placeholder="Length (in hours)" pattern="[0-9]*" onChange={(e) => {this.handleNumberChange(e)}}/>
                     <button className="calendar-formCancel" onClick={this.cancelBtn}> Cancel </button>
                    <button className="calendar-formExport" onClick={this.exportBtn}> Export </button>
                </div>
            );
        }
    }
    handleNumberChange(e) {
        if(e.target === undefined) {
            return -1;
        }
        this.setState({length: e.target.value});
    }
    handleChange(e) {
        if(e.target === undefined) {
            return -1;
        }
        this.setState({input: e.target.value});
    }
    exportBtn() {
        if(isNaN(this.state.length)) {
            window.alert("Please enter a number!");
        } else {
            //now we force a download ;)
            let date = this.state.selected;
            let endDate = date.clone().add(this.state.length, 'h');
            let toExport = 
                "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                "BEGIN:VEVENT\n" +
                "SUMMARY:" + this.state.input + "\n" +
                "DTSTART:" + date.format("YYYYMMDD") + "T" + date.format("HHmmss") + "Z\n" +
                "DTEND:" + endDate.format("YYYYMMDD") + "T" + endDate.format("HHmmss") + "Z\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR"
                ;
            //console.log(toExport);
            //start: date.format('YYYY-M-D-H-m').split("-"),
            //title:  this.state.input,
            //end: endDate.format('YYYY-M-D-H-m').split("-")
                
            let name = window.prompt("Enter a filename", "FileName");
            fileDownload(toExport, name + ".ics");
        } 
        this.setState({exporting: false, input: ''});
    }
    cancelBtn() {
        this.setState({exporting: false, input: ''});
    }
    //returns the JSX for the buttons for the Calendar Component
    render() {
        return (
            <div className='calendar-div'>
                {this.renderColumns()}
                {this.renderForm()}
            </div>
        );
    }
}

export default Calendar;
