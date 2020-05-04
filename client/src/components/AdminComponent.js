import React from 'react';
import AddPackComponent from "./AddPackComponent";
import AdminPackListComponent from "./AdminPackListComponent";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");
const sortPacksByLevel = require("../utils/sortPacksByLevel");

//Admin component that deals with displaying all packs currently stored and rendering them as a AdminPackListComponent
export default class AdminComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            packs: [],
        }
    }

    componentDidMount(){
        //Fetch all packs from database to display to admin if they are authenticated
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
            if (returnObject != null){
                fetch("/api/packs/?allPacks=true", {method: "GET", headers:{"accepts": "application/json", "x-auth-token": returnObject.token}})
                .then(res => res.json())
                .then(async json => {
                    if (json.packs){
                        let packArray = this.state.packs
                        for (let i = 0; i < json.packs.length; i++){
                            packArray.push(json.packs[i]);
                        }
                        packArray.sort(sortPacksByLevel.compare)
                        this.setState({packs: packArray});
                    }
                    
                })
            }
        })
    }

    //Function to map all packs to an AdminPackListComponent
    renderPacks(packs) {
        return packs.map(pack => <AdminPackListComponent key={pack.code} code={pack.code} name={pack.name} rarities={pack.rarityOdds}/>)
    }

    componentDidUpdate(){
        
    }

    //Update state on input change
    handleInputChange = (event) =>{
        this.setState({
            packCode: event.target.value
        })
    }

    //Old legacy function, not currently used. Actually replaced by AddPackComponent
    // handleSubmit = (event) => {
    //     this.setState({
    //         informationMessage: "Processing...",
    //     })
    //     checkForLocalToken.checkForLocalTokenNoUserObject()
    //     .then(returnObject => {
    //       if (returnObject != null){
    //         this.setState({
    //           token: returnObject.token,
    //       })
    //       }
    //     })
    //     .then(() => {
    //         fetch("/api/packs/addpack/" + this.state.packCode, {method: "GET", headers:{"accepts": "application/json", "x-auth-token": this.state.token}})
    //         .then(res => res.json())
    //         .then(json => {
    //             this.setState({
    //                 informationMessage: json.msg
    //             })
    //         });
    //     })
    // }

    render() {
        return (
            <div>
                <AddPackComponent />
                {this.renderPacks(this.state.packs)}
            </div>
        );
    }
}

