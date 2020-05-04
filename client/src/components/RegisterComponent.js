import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import styled from "styled-components";

const Styles = styled.div`
width: 100%;
    .col {
        background-color: #272727;
        width: 100%;
        height: 100vh;
        border-radius: 0;
    }

    .custom-form {
        margin: 0 auto !important;
        width: 80% !important;
    }

    .form-label{
        color: white;
        float: left;
    }
    

    .custom-profile-image{
        width: 150px;
        height: 150px;
        border-radius: 50%;
    }

    .custom-button {
        margin: 0 auto;
    }
`

const H4 = styled.h4`
    color: #FFFFFF;
`

const H5 = styled.h5`
    font-size: 1.2rem;
    color: #FFFFFF;
`

//Component handles registering a new user
export default class RegisterComponent extends React.Component{
    constructor(props, context) {
		super(props, context);

		this.state = {
            open: true,
        };
        
    }

    //Handle input changes for input boxes
    handleInputChange = event => {
		this.setState({
		    [event.target.id]: event.target.value
        });

    };

    //A simple client side check to see if passwords match, this check is also carried out server side to ensure no exploitation of clientside occurs
    //This sheck is simply for better usability and to prevent an unecassary call to server if the passwords do not match
    passwordsMatch(){
        if (this.state.password != this.state.confirmPassword){
            return <H5>Passwords Do Not Match</H5>;
        }
        return true;
    }
    
    //Handling the submit of a new registered user
    //Mainly a call back to the parent component (App.js) which processes this request
    handleSubmit = (event) => {
        event.preventDefault();
        if (this.state.email && this.state.username && this.state.password && this.state.confirmPassword && (this.state.password == this.state.confirmPassword)){
            let dataToParent ={
                register: true,
                email: this.state.email,
                username: this.state.username,
                password: this.state.password,
                confirmPassword: this.state.confirmPassword,
            }
            {this.props.callbackToParent(dataToParent)}
        }
    }

    //Simple click handlers that call back to parent
    loginOnClick = () => {
        let dataToParent ={
            componentToLoad: "LoginComponent",
        }
        {this.props.callbackToParent(dataToParent)}
    }

    registerOnClick = () => {
        let dataToParent ={
            componentToLoad: "LoginComponent",
        }
        {this.props.callbackToParent(dataToParent)}
    }



    render() { 
        return (
            <Styles>
                <Row>
                    <Col>
                        <Row>
                            <Form className="custom-form">
                                <Form.Group controlId="email">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control key="test" type="string" placeholder="Enter Email" onChange={this.handleInputChange}/>
                                </Form.Group>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="string" placeholder="Enter Username" onChange={this.handleInputChange}/>
                                </Form.Group>
                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter Password" onChange={this.handleInputChange}/>
                                    {this.passwordsMatch()}
                                </Form.Group>
                                <Form.Group controlId="confirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Re-Enter Password" onChange={this.handleInputChange}/>
                                    {this.passwordsMatch()}
                                </Form.Group>
                            

                                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                                <br/>
                                <Button className="custom-button" variant="link" onClick={() => this.loginOnClick()}>Back To Login</Button>
                            </Form>
                            
                        </Row>
                    </Col>
                </Row>
            </Styles>
        );
    }
}

