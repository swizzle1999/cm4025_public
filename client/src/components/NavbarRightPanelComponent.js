import { faBoxOpen, faUserShield, faWarehouse, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import styled from "styled-components";
import logo from "../images/pokepacksonline.png";

const Styles = styled.div`
.nav-link{
    color: #FFFFFF !important;
}

.navbar{
    background-color: #272727 !important;
}

.openPacks{
    color: #FFFFFF !important
}
`

const Logo = styled.img`
height: auto;
width: 30%;
`

//Simple nav bar component that just calls back to parent to get it to change the component that is being displayed
export default class NavbarComponent extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            ActiveRightComponent: "",
            ActiveLeftComponent: ""
          }
    }

    //Note most of these methods are just handles that will call back to the parent components and tell them what component to render
    //This is because it is just simply a nav bar

    componentDidMount(){
         this.setState({
             ActiveLeftComponent: this.props.leftPanelComponent,
             ActiveRightComponent: this.props.rightPanelComponent
         })
    }


    //Handle logout click
    handleLogOut = (event) =>{
        event.preventDefault();
        let dataToParent = {
            logOut: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle inventory click
    handleInventory = (event) =>{
        event.preventDefault();
        let dataToParent = {
            inventory: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle open packs click
    handleOpenPacks = (event) =>{
        event.preventDefault();
        let dataToParent = {
            openPacks: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle add packs click
    handleAddPacks = (event) =>{
        event.preventDefault();
        let dataToParent = {
            addPack: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle admin click
    handleAdmin = (event) =>{
        event.preventDefault();
        let dataToParent = {
            admin: true
        }
        this.props.callbackToParent(dataToParent);
    }

    //Handle about click
    handleAbout = (event) =>{
        event.preventDefault();
        let dataToParent = {
            about: true
        }
        this.props.callbackToParent(dataToParent);
    }

    render() {
        return (
            <Styles>
                <Navbar>
                    <Logo src={logo}></Logo>

                    <Nav variant="pills" defaultActiveKey="PackListComponent" activeKey={this.props.rightPanelComponent} className="ml-auto">
                        <Nav.Link  eventKey="PackListComponent" onClick={this.handleOpenPacks}><FontAwesomeIcon icon={faBoxOpen}/> Open Packs</Nav.Link>
                        <Nav.Link eventKey="InventoryListComponent" onClick={this.handleInventory}><FontAwesomeIcon icon={faWarehouse}/> Inventory</Nav.Link>
                        {this.props.admin != false &&
                            <Nav.Link eventKey="AdminComponent" onClick={this.handleAdmin}><FontAwesomeIcon icon={faUserShield}/> Admin</Nav.Link>
                        }
                        <Nav.Link eventKey="AboutComponent" onClick={this.handleAbout}><FontAwesomeIcon icon={faQuestionCircle}/> About</Nav.Link>
                    </Nav>
                </Navbar>
            </Styles>
            
        );
    }
}

