import {
    getFromStorage,
    setInStorage
  } from "./storage"

//Component to check if the browser has a token stored we can use to log them in

//This function returns a promise so we can wait for the database fetch request and then set state with the data we get from the fetch which will in turn update the user interface
export function checkForLocalToken(){
    return new Promise((function(resolve, reject) {
    //Get token from local storage
    const token = getFromStorage("PokePacksOnline");
    //If the token exists
    if (token) {
      //Verify the token
      let headers = {
        "x-auth-token": token
      }
      fetch("api/auth/user/", {method: "GET", headers: headers})
      .then(res => res.json())
      .then(json => {
        //Check if the response contains a user, if it does, then it was a valid token
        if (json){
          if (json._id){
            //Create a JSON object which contains the token, and then another nested JSON object which contains all of the users details needed to display
            let returnObject = {
              "token": token,
              "userObject": json
            }
            resolve(returnObject);
          }

        }
      })

    } 
    //If no token was found
    else {
        console.log("no token");
        resolve(null);
    }
    }));
    
  }

export function checkForLocalTokenNoUserObject(){
    return new Promise((function(resolve, reject) {
    //Get token from local storage
    const token = getFromStorage("PokePacksOnline");
    //If the token exists
    if (token) {

      let returnObject = {
        "token": token,
      }
      resolve(returnObject);

    } 
    //If no token was found
    else {
        resolve(null);
    }
    }));
    
  }
