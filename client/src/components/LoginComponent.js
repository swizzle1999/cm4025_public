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

//Component handles logging in
//Mainly used to send data back to parent to process 
export default class LoginComponent extends React.Component{
    constructor(props, context) {
		super(props, context);

		this.state = {
            open: true,
		};
    }

    //Hadle changes in input boxes for logging in
    handleInputChange = event => {
		this.setState({
		    [event.target.id]: event.target.value
		});
    };

    //Handle when the user clicks the login button, sending email, password and login boolean back to the parent component
    handleSubmit = (event) => {
        event.preventDefault();
        let dataToParent ={
            login: true,
            email: this.state.email,
            password: this.state.password,
        }
        {this.props.callbackToParent(dataToParent)}
    }

    //Handle create account click. Sends the component to render back to parent
    createAccountOnClick = () => {
        let dataToParent ={
            componentToLoad: "RegisterComponent",
        }
        {this.props.callbackToParent(dataToParent)}
    }

    render() {
        const { open } = true;
        return (
            <Styles>
                <Row>
                    <Col>
                        <Row>
                            <Form className="custom-form">
                                <Form.Group controlId="email">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter Email" onChange={this.handleInputChange}/>
                                </Form.Group>
                            </Form>
                        </Row>
                        <Row>
                            <Form className="custom-form">
                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Enter Password" onChange={this.handleInputChange}/>
                                </Form.Group>
                                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                                    Submit
                                </Button>
                            </Form>
                        </Row>
                        <Row>
                            <Button className="custom-button" variant="link" onClick={() => this.createAccountOnClick()}>Create Account</Button>
                        </Row>
                        <h3 style={{color: "white"}}>{this.props.informationMessage}</h3>
                    </Col>
                </Row>
            </Styles>
        );
    }
}

