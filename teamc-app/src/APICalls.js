import axios from 'axios';

/*
 *  make a general API Call
 *      posts:  "add_event"     "edit_event"    "remove_event"  "retrieve_all"  "retrieve_uid"
 *      gets:   "high_uid"      "high_eid"
 *  returns null if an error happens with the API call
 */
export function makeAPICall(method, req_type, data) {
    // return a function that calls
    // makes the then function valid, which allows us to access the response data
    return axios({
        method,
        url: "https://cesiumplanner.appspot.com/_ah/api/cesiumplanner/v1/" + req_type,
        data,
    })
        // must wait for the api call to complete before we can return data
        .then((response) => {
            return response;
            // *_event      returns stuff with data: { uid, friend, events [{}] }
            // high_*id     returns stuff with data: { uid }
            // retrieve_all returns stuff with data: { uid, friend, events [{}] }
            // retrieve_uid returns stuff with data: { uid }
        })
        // catch any errors from the API call
        .catch((error) => {
            console.log(error);
            return null;
        });
};
