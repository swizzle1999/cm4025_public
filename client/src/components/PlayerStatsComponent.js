import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from "styled-components";

const checkForLocalToken = require("../utils/checkForLocalToken");

//Component displays the users stats to the user
//Also houses the delete function in order to delete a users account.
//The actual process of deleting an account is carried out by the parent component however (App.js)
export default class PlayerStatsComponent extends React.Component{
    constructor(props, context) {
		super(props, context);

		this.state = {
            seconds: 0,
            userObject: {},
            open: true,
            showModal: false,
		};
    }

    //Function updates the component by setting state in order to update the users balance
    tick() {
        checkForLocalToken.checkForLocalToken()
        .then(returnObject => {
          if (returnObject != null){
            this.setState({
              userObject: returnObject.userObject,
          })
          }
        })

        this.setState(prevState => ({
          seconds: prevState.seconds + 1
        }));


      }

  //Initially call the tick method as soon as the component loads
  //Then set up a 5 second time to call the tick method to keep the balance up to date
  componentDidMount(){
      this.tick()
      this.interval = setInterval(() => this.tick(), 5000);
  }

  //When the component unmounts make sure to remove the interval or else the function will keep being called and produce errors
  componentWillUnmount(){
    clearInterval(this.interval);
  }

  //Legacy code
  // deleteAccountOnClick(){

  // }

  //Hide and show for the prompt to delete your account
  handleShow = () => {
    this.setState({showModal: true})
  }

  handleClose = () => {
    this.setState({showModal: false})
  }

  //Simple call back to parent to delete an account
  handleDelete = () => {
    let dataToParent ={
      delete: true,
    }
    {this.props.callbackToParent(dataToParent)}
  }

    render() {
        const { open } = true;

        const Styles = styled.div`
            .col {
                background-color: #272727;
                width: 30rem;
                border-radius: 0;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .custom-profile-image{
                width: 150px;
                height: 150px;
                border-radius: 50%;
            }
        `

        const H4 = styled.h4`
            color: #FFFFFF;
            margin-left: 2rem;
        `

        const H5 = styled.h5`
            font-size: 1.2rem;
            color: #FFFFFF;
            margin-left: 2rem;
        `

        return (
            <Styles>
                <Row>
                    <Col>
                        <Row><H4>Username: {this.state.userObject.username}</H4></Row>
                        <Row><H5>Money: ${this.state.userObject.money}</H5></Row>
                        <Row><H5>Level: {this.state.userObject.level}</H5></Row>
                        <Row><Button style={{marginLeft: "1rem", marginTop: "4rem", marginBottom: "1rem"}} variant="danger" onClick={() => this.handleShow()}>Delete Account</Button></Row>
                    </Col>

                    <Col>
                        <Row><H5>Money Tick Rate: x{this.state.userObject.tickMultiplier}</H5></Row>
                        <Row><H5>AFK Wallet Size: {this.state.userObject.afkMax}</H5></Row>
                    </Col>
                </Row>

                <Modal show={this.state.showModal} onHide={this.handleClose} animation={false}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>Are you sure you want to delete this account? This cannot be undone!</Modal.Body>
                  <Modal.Footer style={{margin: "0 auto"}}>
                    <Button variant="danger" onClick={this.handleDelete}>
                      Yes. Delete My Account
                    </Button>
                    <Button variant="success" onClick={this.handleClose}>
                      No. Do not delete my account!
                    </Button>
                  </Modal.Footer>
                </Modal>

            </Styles>
        );
    }
}

