import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import AccordionToggle from 'react-bootstrap/AccordionToggle';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import styled from "styled-components";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");

// A somewhat complicated component that is recieved paramaters from parents and depending on those paramaters this component will perform diffrent actions
//For example if this.props.itemName == "Level Up" then this component is used to buy a level up
export default class ShopItemListComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            token: null,
            itemsComponents: null,
            informationMessage: "",
        }
    }

    componentDidMount(){
        
    }

    componentDidUpdate(prevProps){
        if (this.props.shouldForceUpdate != prevProps.shouldForceUpdate){
            this.renderItem();
        }
    }

    //Function to actually call the API to make a purchace
    //Uses the props passed by the parent to decide what API route to call
    purchaseItem = () => {
        fetch(this.props.apiCallBuy, {method: "GET", headers:{"accepts": "application/json", "x-auth-token": this.state.token}})
        .then(res => res.json())
        .then(json => {
            this.setState({informationMessage: json.msg})
        });
    }

    //Function renders the individual shop item
    renderItem = () => {
        //First ensures the user has a valid token
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
          if (returnObject != null){
            this.setState({
              token: returnObject.token,
            })
          }
        })
        //Send token along to verify the user is who they say they are and in order to grab their inventory
        .then(() => {
            if (this.state.token == null){
                this.setState({informationMessage: "Please Login To Perform This Action"})
            }

            //API call to determine the requirments needed to purchase this item
            fetch(this.props.apiCallRequirments, {method: "GET", headers:{"accepts": "application/json", "x-auth-token": this.state.token}})
            .then(res => res.json())
            .then(json => {

                let requirments = null;
                let cost = 0;
                //The requirments are then mapped onto a HTML element that can be displayed to the user
                //Diffrent logic is applied when the shop item is a level up since a level up requires the user to open a certain ammount of cards in order to actually level up
                if (this.props.itemName == "Level Up"){
                    requirments = json.map(element => <p><b>{element[0] + ":"}</b><br/>{"Have: " + element[1] + "/" + element[2]}<br/>{" Need: " + element[3] + "/" + element[2]}</p>)
                } 
                //Anything that is not a simple level up just requires a certain ammount of money to purchase
                else if (this.props.itemName != "Level Up"){
                    cost = json.nextLevelCost;
                    if (json.msg){
                        requirments = <p><b>{"Current Level: " + json.currentLevel + "/" + json.maxLevel}<br/></b></p>
                        this.setState({informationMessage: json.msg})
                    } else {
                        requirments = <p><b>{"Current Level: " + json.currentLevel + "/" + json.maxLevel}<br/>{"Next Level Cost: " + json.nextLevelCost}<br/>{"Next Level Effect: +" + json.nextLevelEffect}</b></p>
                        this.setState({informationMessage: ""})
                    }
                }
                //Simple error message to show if something is wrong like the this.props.itemName
                else {
                    requirments = "Check ShopItemListComponent. You made a goof"
                }

                //Set state of the item name, the items requirments and then a cost button to actually purchase the item. This state is in HTML so it can be displayed in the render function 
                this.setState({
                    itemsComponents: 
                        <tr>
                            <td>{this.props.itemName}</td>
                            <td>{requirments}</td>
                            <td><Button variant="success" onClick={this.purchaseItem}>${cost}</Button></td>
                        </tr>
                })
            })
        });
            
    }

    requirmentsCall = () => {
        
    }

    render() {   
        return (
            <div>
                <Card>
                    <Card.Header>
                        <AccordionToggle as={Button} onClick={this.renderItem} variant="link" eventKey={this.props.itemName}>
                            {this.props.itemName}
                        </AccordionToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={this.props.itemName}>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Description</th>
                                        <th>Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.itemsComponents}
                                </tbody>
                            </Table>
                            {this.state.informationMessage}
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </div>
        );
    }
}

