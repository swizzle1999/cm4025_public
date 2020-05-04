import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import AccordionToggle from 'react-bootstrap/AccordionToggle';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import styled from "styled-components";
import InventoryListCardComponent from "./InventoryListCardComponent";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");

//Componment that is used to display all packs in the users inventory and cards within that pack to the user
//Individual Cards are displayed by passing their properties to the InventoryListCardComponent
export default class InventoryListComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            inventory: null,
            cardsComponent: null,
            informationMessage: "Loading...",
            displayCard: false,
          }
    }

    componentDidMount(){

    }

    //When component updates it checks to see if the search filter has changed
    //If it has it knows it must re render the cards
    //"prevState.cardsComponent != null" works because even though if we type something in that gets no result. its not null, its an empty array
    componentDidUpdate(prevProps, prevState){
        if (prevProps.filter != this.props.filter && prevState.cardsComponent != null){
            this.setState({informationMessage: "Loading...", cardsComponent: null})
            this.renderCards()
        }
    }

    //Function that is called when the props of this component change, performs a state change to update the filter
    //Cards component is set to null to get rid of all existing cards from the list
    static getDerivedStateFromProps(nextProps, prevState){
        if (nextProps.filter != prevState.filter){
            return ({filter: nextProps.filter})
        }
    }

    renderCards = () => {
        //Initial empty inventory
        let inventory = null

        //Check the user is valid and grab token
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
          if (returnObject != null){
            this.setState({
              token: returnObject.token,
          })
          }
        })
        //Send token along to verify the user is who they say they are and in order to grab their inventory
        .then(async () => {
            await fetch("/api/auth/user/inventory", {method: "GET", headers:{"accepts": "application/json", "x-auth-token": this.state.token}})
            .then(res => res.json())
            .then(async json => {
                //Go over the users inventory and find the correct pack
                for (let i = 0; i < json.inventory.length; i++){
                    if (json.inventory[i].code == this.props.code){
                        //Set the correct pack to the current inventory
                        inventory = json.inventory[i].cards;
                    }
                }

                if (inventory){
                    //Remove any cards that do not match the filter from the json
                    for (let i = 0; i < inventory.length; i++){
                        if (!JSON.stringify(inventory[i].name).includes(this.props.filter)){
                            inventory.splice(i, 1)
                            i--
                        }
                    }
                } else {
                    inventory = null;
                }

            })
        })
        .then(() => {
            //If the inventory still equals null then we own no cards from this set
            if (inventory == null){
                this.setState({informationMessage: "You Own No Cards From This Set"})
            } else {
                //If the inventory does contain elements, map them to card components to display them
                this.setState({cardsComponent: inventory.map(card => <InventoryListCardComponent key={card.id} code={card.id} name={card.name} quantity={card.quantity} rarity={card.rarity} packCode={this.props.code}/>)})
                this.setState({informationMessage: null})
            }
            
        })
        
    }

    childCallback(dataFromChild){

    }

    render() {

        const Logo = styled.img`
            height: auto;
            width: 15%;
        `
        

        //<Logo className="float-left" src={logo}>
        //<NavbarBrand style={{color: "#FFFFFF", fontSize: "2rem",}}></NavbarBrand>
        return (
            <div>
                <Card>
                    <Card.Header>
                        <AccordionToggle as={Button} onClick={this.renderCards} variant="link" eventKey={this.props.code+"User"}>
                            {this.props.name}  
                            <Logo style={{marginLeft: "0.5rem", marginRight: "0.5rem"}}src={"https://cm4025.s3.amazonaws.com/packs/" + this.props.code + "/" + this.props.code + "Logo.jpg"}/>
                        </AccordionToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={this.props.code+"User"}>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Card Code</th>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Rarity</th>
                                        <th>Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.cardsComponent} 
                                </tbody>
                            </Table>
                            <h1>{this.state.informationMessage}</h1>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </div>
        );
    }
}

