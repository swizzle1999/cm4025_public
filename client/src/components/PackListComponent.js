import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import AccordionToggle from 'react-bootstrap/AccordionToggle';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Table from 'react-bootstrap/Table';
import styled from "styled-components";
import PackListCardComponent from "./PackListCardComponent";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");

const Logo = styled.img`
height: auto;
width: 15%;
`

const Img = styled.img`
    height: auto;
    width: 30%;
`

//This component is similar to the IventoryListComponent in that it displays one specific pack to the user and then individual cards are displayed via the PackListCardComponent
export default class PackListComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            cost: 0,
            displayPulledCards: false,
            pulledCards: {},
            cardsComponent: null,
            informationMessage: "Loading...",
            filter: "",
            buttonText: "",
            ownedCardCount: 0,
            totalCardCount: 0,
            token: null,
            forceUpdate: 0
          }
    }

    //Set pack cost if the cost props is null for any reason
    componentDidMount(){
        if (this.props.cost == null){
            this.setState({cost: 10});   
            
            this.setState({
                buttonText: "Open Pack $" + "10"
            })
        } else {
            this.setState({cost: this.props.cost})

            this.setState({
                buttonText: "Open Pack $" + this.props.cost
            })
        }

        this.fetchHowManyCardsUserOwns();
    }

    //When component updates it checks to see if the search filter has changed
    //If it has it knows it must re render the cards
    //"prevState.cardsComponent != null" works because even though if we type something in that gets no result. its not null, its an empty array
    componentDidUpdate(prevProps, prevState){
        if (prevProps.filter != this.props.filter && prevState.cardsComponent != null){
            this.setState({informationMessage: "Loading..."})
            this.renderCards()
        }

        if (this.props.packListForceUpdate != prevProps.packListForceUpdate){
            this.fetchHowManyCardsUserOwns();
        }
    }

    //Function that is called when the props of this component change, performs a state change to update the filter
    //Cards component is set to null to get rid of all existing cards from the list
    static getDerivedStateFromProps(nextProps, prevState){
        if (nextProps.filter != prevState.filter){
            return ({filter: nextProps.filter, cardsComponent: null})
        }
    }

    //Performs a fetch request to the API in order to get data about a specific pack and then filters all of the cards in that pack against the filter the user specified at the top of the screen
    //The cards are then mapped to the PackListCardComponent and stored in the cardsComponent state in order to be displayed
    renderCards = () => {
        fetch("/api/packs/" + this.props.code, {method: "GET", headers:{"accepts": "application/json"}})
        .then(res => res.json())
        .then(async json => {
            //Loop through all the cards and remove that ones that do not include the search filter
            for (let i = 0; i < json.cards.length; i++){
                if (!JSON.stringify(json.cards[i].name).includes(this.props.filter)){
                    json.cards.splice(i, 1)
                    i--
                }
            }
            this.setState({
                cardsComponent: json.cards.map(card => <PackListCardComponent key={card.id} code={card.id} name={card.name} rarity={card.rarity} filter={this.props.filter} packCode={this.props.code}/>),
                informationMessage: "",
            })
        })
    }

    //Simple function that calls to the API in order to determine how many cards the user owns out of a specific pack
    fetchHowManyCardsUserOwns = () => {
        let inventory = null
        let token = null;
        //Check the user is valid and grab token
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
          if (returnObject != null){
            token = returnObject.token
          }
        })
        //Send token along to verify the user is who they say they are and in order to grab their inventory
        .then(async () => {
            if (token){
                await fetch("/api/auth/user/inventory", {method: "GET", headers:{"accepts": "application/json", "x-auth-token": token}})
                .then(res => res.json())
                .then(async json => {
                    if (json.inventory){
                        //Go over the users inventory and find the correct pack
                        for (let i = 0; i < json.inventory.length; i++){
                            if (json.inventory[i].code == this.props.code){
                                //Set the correct pack to the current inventory
                                inventory = json.inventory[i].cards;
                            }
                        }
    
                        if (inventory){
                            this.setState({ownedCardCount: inventory.length})
                        } else {
                            this.setState({ownedCardCount: 0})
                        }
                    }
                })
            } else {
                this.setState({ownedCardCount: 0})
            }
        })
    }

    //Function deals with actually opening this specific pack.
    //API call is sent the users token and then returns the 3 cards the user recieved if they met the requirments to open the pack 
    openPack = (event) => {
        this.setState({
            buttonText: "Opening Pack...",
        })

        event.preventDefault();
        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
            if (returnObject != null){
                fetch("/api/packs/open/"+this.props.code, {method: "GET", headers:{"accepts": "application/json", "x-auth-token": returnObject.token}})
                .then(res => res.json())
                .then(json => {
                    this.setState({
                        pulledCards: json,
                    })
                    this.showPulledCards();
                })
                .then(() => {
                    this.setState({
                        buttonText: "Open Pack $" + this.state.cost,
                    })

                    this.fetchHowManyCardsUserOwns();
                    let dataToParent ={
                        openedPack: true,
                    }
                    {this.props.callbackToParent(dataToParent)}
                })
                
            }
        })
    }

    //Simple hide and show functions to hide and show the opened cards from this pack
    hidePulledCards = () =>{
        this.setState({displayPulledCards: false});
    }

    showPulledCards = () =>{
        this.setState({displayPulledCards: true});
    }

    //Itterates over the cards the user just recieved and displays the cards image
    processPulledCards = () => {
        if (this.state.pulledCards.error){
            return (
                <div style={{textAlign: "center"}}>
                    <h1>{this.state.pulledCards.error}</h1>
                </div>
            );
        } else {
            if (this.state.pulledCards[0] && this.state.pulledCards[1] && this.state.pulledCards[2]){
                return (
                    <div style={{textAlign: "center"}}>
                        <Img src={"https://cm4025.s3.eu-west-2.amazonaws.com/packs/" + this.state.pulledCards[0].setCode + "/" + this.state.pulledCards[0].id + ".jpg"}></Img>
                        <Img src={"https://cm4025.s3.eu-west-2.amazonaws.com/packs/" + this.state.pulledCards[1].setCode + "/" + this.state.pulledCards[1].id + ".jpg"}></Img>
                        <Img src={"https://cm4025.s3.eu-west-2.amazonaws.com/packs/" + this.state.pulledCards[2].setCode + "/" + this.state.pulledCards[2].id + ".jpg"}></Img>
                    </div>
                );
            } else {
                return;
            }
        }

    }

    render() {
        return (
            <div>
                <Modal show={this.state.displayPulledCards} onHide={this.hidePulledCards} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                    <Modal.Header>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Cards
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.processPulledCards()}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.hidePulledCards}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <Card>
                    <Card.Header>
                        <AccordionToggle as={Button} onClick={this.renderCards} variant="link" eventKey={this.props.code+"Server"}>
                            {this.props.name}  
                            <Logo style={{marginLeft: "0.5rem", marginRight: "0.5rem"}}src={"https://cm4025.s3.amazonaws.com/packs/" + this.props.code + "/" + this.props.code + "Logo.jpg"}/>
                            <br></br>
                            Level Requirment: {this.props.level}
                        </AccordionToggle>
                        <br></br>
                        <Button variant="success" onClick={this.openPack}>{this.state.buttonText}</Button>
                        <br></br>
                        <br></br>
                        <p>You Own: {this.state.ownedCardCount}/{this.props.totalCards} Cards In This Set</p>
                    </Card.Header>
                    <Accordion.Collapse eventKey={this.props.code+"Server"}>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Card Code</th>
                                        <th>Name</th>
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

