import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import AccordionToggle from 'react-bootstrap/AccordionToggle';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import styled from "styled-components";

const fetch = require("node-fetch");
const checkForLocalToken = require("../utils/checkForLocalToken");


const Logo = styled.img`
height: auto;
width: 15%;
`

//A list of all packs to be displayed within the admin section
export default class PackListComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            rarities: [],
            cost: 0,
            level: 0,
            packProperties: null,
            costProperty: null,
            levelProperty: null,
            informationMessage: "",
            recommendedOdds: [],
        }
    }

    componentDidMount(){
        //Set the rarities state to be the rarities that were passed in by the parent as props
        let rarities = this.state.rarities
        for(var key in this.props.rarities){
            if (this.props.rarities.hasOwnProperty(key)){
                rarities.push([key, this.props.rarities[key]])
            }
        }

        this.setState({
            rarities: rarities
        })
    }

    //Map the recommended odds to <div>'s
    renderRecommendedOdds = () => {
        return this.state.recommendedOdds.map(odd => <div style={{marginRight: "1rem", display: "inline-block", margin: "0 auto"}}><p>{odd}</p></div>)
    }

    //Function to update the rarities state whenever one is changed in the input box
    propertyChange = (event, rarityName) => {
        for (let i = 0; i < this.state.rarities.length; i++){
            if (this.state.rarities[i][0] == rarityName){
                let rarities = this.state.rarities;
                rarities[i][1] = event.target.value
                this.setState({rarities: rarities})
            }
        }
    }

    costChange = (event) => {
        this.setState({cost: event.target.value})
    }

    levelChange = (event) => {
        this.setState({level: event.target.value})
    }

    //This function is used to render all of the diffrent card rarities to screen
    //This function also suggests odds to the user so that they do not need to calculate them themselves

    renderProperties = () => {
        let recommendedOdds = []
        let oddsRemaining = 100
        for (let i = 0; i < this.state.rarities.length; i++){
            if ((i + 1) == this.state.rarities.length){
                let totalInOddsArray = 0
                for (let j = 0; j < recommendedOdds.length; j++){
                    totalInOddsArray += recommendedOdds[j]
                }
                recommendedOdds.push(Number((100-totalInOddsArray).toFixed(2)))
            } else {
                let calculation = Number((0.6 * oddsRemaining).toFixed(2))
                recommendedOdds.push(calculation)
                oddsRemaining = oddsRemaining - calculation
            }
        }
        this.setState({recommendedOdds: recommendedOdds})

        //This is a technique where you can use set state to set html so when i render it at the bottom of the page the code is a little bit neater
        this.setState({
            levelProperty: <tr><td>Level Requirment</td><td><Form.Control type="string" placeholder="" onChange={this.levelChange}/></td></tr>
        })
        this.setState({
            costProperty: <tr><td>Cost</td><td><Form.Control type="string" placeholder="" onChange={this.costChange}/></td></tr>
        })
        this.setState({
            packProperties: this.state.rarities.map(rarity => <tr><td>{rarity[0]}</td><td><Form.Control type="string" placeholder="" onChange={(e) => this.propertyChange(e, rarity[0])}/></td></tr>)
        })
        
    }

    //Function that turns the information from the state of this component into a json type object to send to the API so it can be processed and the rarity odds can then be updated
    submitProperties = () => {
        let dataToPost = {}

        dataToPost["cost"] = this.state.cost;
        dataToPost["level"] = this.state.level;

        for (let i = 0; i < this.state.rarities.length; i++){
            dataToPost[this.state.rarities[i][0]] = this.state.rarities[i][1]
        }

        dataToPost = JSON.stringify(dataToPost)

        checkForLocalToken.checkForLocalTokenNoUserObject()
        .then(returnObject => {
            if (returnObject != null){
                fetch("api/packs/setproperties/" + this.props.code + "/", {method: "POST", body: dataToPost, headers:{"Content-Type": "application/json", "x-auth-token": returnObject.token}})
                .then(res => res.json())
                .then(json => {
                    this.setState({informationMessage: json.msg})
                });
            }
        })

    }


   
    render() {
        return (
            <div>
                <Card>
                    <Card.Header>
                        <AccordionToggle as={Button} onClick={this.renderProperties} variant="link" eventKey={this.props.code+"Server"}>
                            {this.props.name}  
                            <Logo style={{marginLeft: "0.5rem", marginRight: "0.5rem"}}src={"https://cm4025.s3.amazonaws.com/packs/" + this.props.code + "/" + this.props.code + "Logo.jpg"}/>
                        </AccordionToggle>
                        <br></br>
                    </Card.Header>
                    <Accordion.Collapse eventKey={this.props.code+"Server"}>
                        <Card.Body>
                            <h4>Recommended Odds</h4>
                            <h4>(Most Common To Rarest)</h4>
                            <Row style={{textAlign: "center"}}>
                                {this.renderRecommendedOdds()}
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Property Name</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.costProperty}
                                    {this.state.levelProperty}
                                    {this.state.packProperties} 
                                </tbody>
                            </Table>
                            <h3>{this.state.informationMessage}</h3>
                            <Button onClick={this.submitProperties}>Submit</Button>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </div>
        );
    }
}

