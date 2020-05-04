import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import AccordionToggle from 'react-bootstrap/AccordionToggle';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from 'react-bootstrap/Table';
import styled from "styled-components";

const Styles = styled.div`
color: white;
`
//Simple about page
export default class AboutComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
          }
    }

    componentDidMount(){

    }

    

    render() {
        return (
            <Styles>
                <h2><u>What is this website?</u></h2>
                <h2>This website is a basic pokemon card opening game! All cards are pulled from the <a href="https://pokemontcg.io/">Pokemon TCG Api</a></h2>
                <br/>
                <h2><u>What do i do?</u></h2>
                <h2>You will start with an account at level 1. You gain money slowly over time but the rate of this as well as the max ammount of money you can hold can be increased with upgrades from the shop! <br/><br/> The main idea of the game is to try and collect enough pokemon cards to move on to the next level and open more rare packs and hopefully collect em all! <br/><br/> The max ammount of money you can hold at one time is dictated by your AFK Wallet Size</h2>
                <br/>
                <h2><u>How do i level up?</u></h2>
                <h2>You can do this by clicking on the shop tab on the left panel and then clicking the "Level Up" shop item. <br/><br/> There you will find a description of how many unique cards you have from each pack and how many are needed to level up!</h2>
                <br/>
                <h2><u>Is this website flooding the API with traffic?</u></h2>
                <h2>Nope. To make this website as considerate as possible towards the API owners, whenever a pack is requested from their database it is then stored on this servers databases and requested from there so that only one request is ever needed per pack to the API!</h2>
                <br />
                <h2><u>What API does this website use?</u></h2>
                <h2><a href="https://pokemontcg.io/">PokemonTCG</a></h2>
                <br />
                <h2><u>Does this website use any frameworks?</u></h2>
                <ul>
                    <li><h2>The framework used for the front end is <a href="https://react-bootstrap.github.io/">React Bootstrap</a></h2></li>
                    <li><h2>Node Fetch is used for API calls <a href="https://www.npmjs.com/package/node-fetch">node-fetch</a></h2></li>
                    <li><h2>Mongoose is used to interact with the MongoDB database <a href="https://www.npmjs.com/package/mongoose">Mongoose</a></h2></li>
                    <li><h2>Styled components was used to add some extra CSS more easily to components <a href="https://styled-components.com/">Styled Components</a></h2></li>
                    <li><h2>AWS S3 was used to store the images pulled from the API <a href="https://aws.amazon.com/s3/">AWS S3</a></h2></li>
                    <li><h2>Font Awesome was used for icons throughout the website, especially in the navigation bar <a href="https://fontawesome.com/">Font Awesome</a></h2></li>
                    <li><h2>jsonwebtoken was used to implement the login feature with Json Web Tokens <a href="https://www.npmjs.com/package/jsonwebtoken">jsonwebtoken</a></h2></li>
                    <li><h2>Config was used to store configuration details in a simple json file <a href="https://www.npmjs.com/package/config">config</a></h2></li>
                    <li><h2>bcrypt was used to hash passwords and compare hashes for logging in <a href="https://www.npmjs.com/package/bcrypt">bcrypt</a></h2></li>
                    <li><h2>aws-sdk was used to access the AWS S3 image bucket to upload images <a href="https://www.npmjs.com/package/aws-sdk">aws-sdk</a></h2></li>
                    <li><h2>A simple package that sanitizes input to prevent NoSQL injection <a href="https://www.npmjs.com/package/mongo-sanitize">mongo-sanitize</a></h2></li>
                    
                </ul>
                
            </Styles>
        );
    }
}

