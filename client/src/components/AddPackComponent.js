import React from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");

//function that deals with adding a pack.
//This is an admin only accessible component that is protected by requiring an admin token when it is processed on the server end
export default class AddPackComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            packCode: "",
            informationMessage: "",
            rarityForms: null,
            allRarities: {},
          }
    }

    //Just handles chanegs to the input box and sets the state to the new text in the input box
    handlePackIDInputChange = (event) =>{
        this.setState({
            packCode: event.target.value
        })
    }

    //The function that handles a submit when a user wants to add a new pack
    handlePackIDSubmit = (event) => {
        this.setState({
            informationMessage: "Processing...",
        })

        //Quick authentication check to ensure the user is authenticated
        //There is actually no need to check if the user is an admin here since the fetch request farther down the the API will check that for us
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
          if (returnObject != null){
            this.setState({
              token: returnObject.token,
          })
          }
        })
        .then(() => {
            //API call to add the pack, sends the users token along to verify it is an admin
            fetch("/api/packs/addpack/" + this.state.packCode, {method: "GET", headers:{"accepts": "application/json", "x-auth-token": this.state.token}})
            .then(res => res.json())
            .then(json => {
                this.setState({
                    informationMessage: json.msg
                })

                //Old legacy code from when this was a non admin function
                //Kept it around as i felt it would be usefull for reference elsewhere
                
                // if (json.rarities){
                //     let rarities = []
                //     //it should be noted that 
                //     rarities.push(
                //         <Form.Group controlId="cost">
                //             <div className="d-flex align-items-center"> 
                //                 <p style={{color: "white"}}>Cost: </p> <Form.Control onChange={(e) => this.handleRarityInputChange(e, "cost")} style={{marginRight: "0.5rem"}} type="number" placeholder=""/>
                //             </div>
                //         </Form.Group>
                //     )

                //     json.rarities.forEach(rarity => {
                //         rarities.push(
                //             <Form.Group controlId={rarity}>
                //                 <div className="d-flex align-items-center"> 
                //                     <p style={{color: "white"}}>{rarity} Rarity: </p> <Form.Control onChange={(e) => this.handleRarityInputChange(e, rarity)} style={{marginRight: "0.5rem"}} type="number" placeholder=""/>
                //                 </div>
                //             </Form.Group>
                //         )
                //     })
                //     rarities.push(<Button onClick={this.handleRaritySubmit}>Submit</Button>)
                //     this.setState({
                //         rarityForms: rarities
                //     })
                // }
            });
        })
    }

    render() {
        return (
            <div>
                <Form className="custom-form">
                    <Form.Group controlId="packId">
                    <Form.Label style={{color: "white" ,width: "100%"}}>Pack ID</Form.Label>
                        <div className="d-flex align-items-center"> 
                            <Form.Control style={{marginRight: "0.5rem"}} type="string" placeholder="" onChange={this.handlePackIDInputChange}/>
                            <Button variant="primary" onClick={this.handlePackIDSubmit}>
                                Add
                            </Button>
                        </div>
                        <h2 style={{color :"white"}}>{this.state.informationMessage}</h2>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

