import React from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styled from "styled-components";

const Img = styled.img`
    height: auto;
    width: 30%;
`

//Component to show an individual cards image
//This component recives data from PackListComponent about the individual cards details
export default class PackListCardComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            displayCard: false,
          }
    }

    //Hide the card
    hideCard = () =>{
        this.setState({displayCard: false});
    }

    //Show the card
    showCard = () =>{
        this.setState({displayCard: true});
    }

    //Fetches the cards image that needs to be displayed from my AWS image bucket
    //The packs code and the cards code is sent in from the parent which is then combined to form a url
    processCardToDisplay = () => {
        return (
            <div style={{textAlign: "center"}}>
                <Img src={"https://cm4025.s3.eu-west-2.amazonaws.com/packs/" + this.props.packCode + "/" + this.props.code + ".jpg"}></Img>
            </div>
        );
    }

    //Just a method to either display a "Image" button to show the image
    //If this is clicked then it will instead show a modal that holds the actual image of the card
    displayImageButton = () => {
        if (this.state.displayCard == false){
            return (
                <Button onClick={this.showCard}>Image</Button>
            );
        }
        else {
            return (
                <Modal show={this.state.displayCard} onHide={this.hideCard} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Card
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.processCardToDisplay()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.hideCard}>Close</Button>
                </Modal.Footer>
                </Modal>
                );
        }
        
    }

    render() {
        return (
            <tr>
                <td>{this.props.code}</td>
                <td>{this.props.name}</td>
                <td>{this.props.rarity}</td>
                <td>{this.displayImageButton()}</td>
            </tr>
        );
    }
}

