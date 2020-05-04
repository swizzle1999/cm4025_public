import React from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styled from "styled-components";

const Img = styled.img`
    height: auto;
    width: 30%;
`

//Component to display individual cards in a users inventory
export default class InventoryListCardComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            displayCard: false,
          }
    }


    hideCard = () =>{
        this.setState({displayCard: false});
    }

    showCard = () =>{
        this.setState({displayCard: true});
    }

    //function uses my AWS bucket where the images are stored to retrieve the images
    processCardToDisplay = () => {
        return (
            <div style={{textAlign: "center"}}>
                <Img src={"https://cm4025.s3.eu-west-2.amazonaws.com/packs/" + this.props.packCode + "/" + this.props.code + ".jpg"}></Img>
            </div>
        );
    }

    //Function used to display the image of a card
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
                    <td>{this.props.quantity}</td>
                    <td>{this.props.rarity}</td>
                    <td>{this.displayImageButton()}</td>
                </tr>
        );
    }
}

