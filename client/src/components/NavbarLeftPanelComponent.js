import { faAddressCard, faCoins, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import styled from "styled-components";

const Styles = styled.div`

.nav-link{
    color: #FFFFFF !important;
}

.col{
    background-color: #272727;
    width: 100%;
    border-radius: 0;
}

.navbar{
    background-color: #272727 !important;
}
`

//Simple nav bar component that just calls back to parent to get it to change the component that is being displayed
export default class NavbarComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {

          }
    }

    //Note most of these methods are just handles that will call back to the parent components and tell them what component to render
    //This is because it is just simply a nav bar
    
    //Handle logout click
    handleLogOut = (event) =>{
        event.preventDefault();
        let dataToParent = {
            logOut: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle player stats click
    handlePlayerStats = (event) =>{
        event.preventDefault();
        let dataToParent = {
            playerStats: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle shop click
    handleShop = (event) =>{
        event.preventDefault();
        let dataToParent = {
            shop: true
        }
        this.props.callbackToParent(dataToParent);
    }

    // //Handle open packs click
    // handleOpenPacks = (event) =>{
    //     event.preventDefault();
    //     let dataToParent = {
    //         openPacks: true
    //     }
    //     this.props.callbackToParent(dataToParent);
    // }

    // //Handle add packs click
    // handleAddPacks = (event) =>{
    //     event.preventDefault();
    //     let dataToParent = {
    //         addPack: true
    //     }
    //     this.props.callbackToParent(dataToParent);
    // }

    render() {
        return (
            <Styles>
                <Row>
                    <Col>
                    <Navbar>
                        <Nav variant="pills" defaultActiveKey="PlayerStatsComponent" activeKey={this.props.leftPanelComponent} className="mr-auto">
                            <Nav.Link eventKey="PlayerStatsComponent" onClick={this.handlePlayerStats}><FontAwesomeIcon icon={faAddressCard}/> Player Stats</Nav.Link>
                            <Nav.Link eventKey="ShopComponent" onClick={this.handleShop}><FontAwesomeIcon icon={faCoins}/> Shop</Nav.Link>
                            <Nav.Link eventKey="LoginComponent" onClick={this.handleLogOut}><FontAwesomeIcon icon={faSignOutAlt}/> Log Out</Nav.Link>
                        </Nav>
                    </Navbar>
                    </Col>
                </Row>
            </Styles>
            
        );
    }
}

