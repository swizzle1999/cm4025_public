import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styled from "styled-components";
import ShopItemListComponent from "./ShopItemListComponent";

const Styles = styled.div`
            .col {
                background-color: #272727;
                width: 30rem;
                height: 100vh;
                border-radius: 0;
            }

            .custom-profile-image{
                width: 150px;
                height: 150px;
                border-radius: 50%;
            }
        `

//Just a simple component used to display other components
export default class ShopComponent extends React.Component{
    constructor(props, context) {
		super(props, context);

		this.state = {

		};
    }

    componentDidMount(){
        if (this.props.shouldForceUpdate){
            this.setState({state: this.state})
        }
    }

    render() {
        
        return (
            <Styles>
                <Row>
                    <Col>
                        <Accordion>
                            {/* Level Up */}
                            <ShopItemListComponent shouldForceUpdate={this.props.shouldForceUpdate} apiCallBuy={"/api/shop/level/"} apiCallRequirments={"/api/shop/level/requirments"} itemName={"Level Up"} itemCost={0} shouldForceUpdate={this.props.shouldForceUpdate}/>
                            {/* Increase Money Tick Rate */}
                            <ShopItemListComponent apiCallBuy={"/api/shop/tickMultiplier/"} apiCallRequirments={"/api/shop/tickMultiplier/requirments"} itemName={"Increase Money Gain Rate"} itemCost={0}/>
                            {/* Increase AFK Wallet*/}
                            <ShopItemListComponent apiCallBuy={"/api/shop/afkMax/"} apiCallRequirments={"/api/shop/afkMax/requirments"} itemName={"Increase Wallet Size"} itemCost={0}/>
                        </Accordion>
                    </Col>
                </Row>
            </Styles>
        );
    }
}

