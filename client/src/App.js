import React from 'react';
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import Form from 'react-bootstrap/Form';
import Row from "react-bootstrap/Row";
import styled from "styled-components";
import './App.css';
import AddPackComponent from "./components/AddPackComponent";
import AdminComponent from "./components/AdminComponent";
import InventoryListComponent from "./components/InventoryListComponent";
import LoginComponent from './components/LoginComponent';
import NavbarLeftPanelComponent from './components/NavbarLeftPanelComponent';
import NavbarRightPanelComponent from './components/NavbarRightPanelComponent';
import PackListComponent from "./components/PackListComponent";
import PlayerStatsComponent from './components/PlayerStatsComponent';
import RegisterComponent from './components/RegisterComponent';
import ShopComponent from "./components/ShopComponent";
import AboutComponent from "./components/AboutComponent";
import { setInStorage } from "./utils/storage";


const checkForLocalToken = require("./utils/checkForLocalToken");
const sortPacksByLevel = require("./utils/sortPacksByLevel");

const fetch = require("node-fetch");

const Styles = styled.div`
.col-sm-4 {
    padding-left: 0 !important;
    height: 100vh;
}
`

class App extends React.Component {
  constructor(props){
    super(props);

    //Setting up the initial state
    this.state = {
      time: Date.now(),
      packs: [],
      token: "",
      admin: false,
      userObject: {},
      leftPanelComponent: "PlayerStatsComponent",
      leftPanelComponentInformationMessage: "",
      rightPanelComponent: "PackListComponent",
      packFilter: "",
      openedPackForceShopUpdate: 0,
      packListForceUpdate: 0
    }
  }


  componentDidMount(){
    //Quick check to see if the user has an existing token
    checkForLocalToken.checkForLocalToken()
    .then(returnObject => {
      if (returnObject != null){
        this.setState({
          token: returnObject.token,
          admin: returnObject.userObject.admin,
          userObject: returnObject.userObject,
      })
      }
    })

    //Fetch all the packs that exist in the database to be displayed
    fetch("/api/packs", {method: "GET", headers:{"accepts": "application/json"}})
      .then(res => res.json())
      .then(json => {
        let packArray = this.state.packs
        for (let i = 0; i < json.packs.length; i++){
          packArray.push(json.packs[i]);
        }
        packArray.sort(sortPacksByLevel.compare)
        this.setState({packs: packArray});
      })

      

  }

  // -------------------- "ToRender" functions decide which component should be rendered on that side of the screen --------------------
  //Function that is used to change what renders on the left panel
  leftPanelComponentToRender(){
    //Switch statement to check which component should be rendered on the left
    switch(this.state.leftPanelComponent){
      case "LoginComponent":
        //If a token does not exist the user is not logged in, so will just show the player stats component
        if(this.state.token){
          this.setState({
            leftPanelComponent: "PlayerStatsComponent",
          })
        } else {
          return <LoginComponent informationMessage={this.state.leftPanelComponentInformationMessage} callbackToParent={this.leftPanelComponentChildCallback}/>
        }
      case "RegisterComponent":
        return <RegisterComponent callbackToParent={this.leftPanelComponentChildCallback}/>
      case "PlayerStatsComponent":
        if(this.state.token){
          return <PlayerStatsComponent token={this.state.token} callbackToParent={this.leftPanelComponentChildCallback}/>  
        } else {
          this.setState({
            leftPanelComponent: "LoginComponent",
          })
        }
      case "ShopComponent":
        if(this.state.token){
          return <ShopComponent token={this.state.token} shouldForceUpdate={this.state.openedPackForceShopUpdate} callbackToParent={this.leftPanelComponentChildCallback}/> 
        } else {
          this.setState({
            leftPanelComponent: "LoginComponent",
          })
        }
    }
  }

  //Same as function above, just a switch statement to see what should be rendered on the right side of the screen
  rightPanelComponentToRender(){
    switch(this.state.rightPanelComponent){
      case "PackListComponent":
        return this.renderPacks(this.state.packs)
      case "InventoryListComponent":
        if (this.state.token){
          return this.renderUserPacks(this.state.packs);
        } else {
          this.setState({
            rightPanelComponent: "PackListComponent",
          })
        }
      case "AddPackComponent":
        return <AddPackComponent />
      case "AdminComponent":
        return <AdminComponent />
      case "AboutComponent":
        return <AboutComponent />

    }
  }
  // ================================================================================

  // -------------------- "CallBack" are used by child components to send information back to their parent (this) --------------------
  //This is the function that the nav bar will call back to to inform the parent (this component) which component it should now render
  //This is how child components like the navbar communicate with their parent components
  NavbarRightPanelComponentChildCallback = dataFromChild => {
    if (dataFromChild.openPacks){
      this.setState({
        rightPanelComponent: "PackListComponent",
      })
    }else if (dataFromChild.inventory){
      this.setState({
        rightPanelComponent: "InventoryListComponent",
      })
    }else if (dataFromChild.addPack){
      this.setState({
        rightPanelComponent: "AddPackComponent",
      })
    }else if (dataFromChild.admin){
      //Yes a client could modify this and get access to the admin panel
      //But all the API calls from the admin panel are protected serverside with tokens so it dosent actually matter if they can acess it. They get no important information nor can they actually send any requests from it
      //This is here just because it makes sense for a user not to be able to instantly click into an admin panel
      if (this.state.admin == true) {
        this.setState({
          rightPanelComponent: "AdminComponent",
        })
      }
    }else if (dataFromChild.about){
      this.setState({
        rightPanelComponent: "AboutComponent",
      })
    }
  }

  //Similar to the function above but instead for the left nav bar
  NavbarLeftPanelComponentChildCallback = dataFromChild => {
    if (dataFromChild.logOut){
      //Remove the users token from storage if they want to log out
      setInStorage("PokePacksOnline", "");
      this.setState({
        token: "",
        userObject: {},
        packListForceUpdate: this.state.packListForceUpdate + 1,
      });
    }
    else if (dataFromChild.playerStats){
      this.setState({
        leftPanelComponent: "PlayerStatsComponent",
      })
    }
    else if (dataFromChild.shop){
      this.setState({
        leftPanelComponent: "ShopComponent",
      })
    }
  }

  //The callback all components that use the left panel use to communicate with the parent (this)
  leftPanelComponentChildCallback = dataFromChild => {
    //if the child is telling the parent to load a new component
    if (dataFromChild.componentToLoad){
      this.setState({
        leftPanelComponent: dataFromChild.componentToLoad,
      })
    } 
    //If the child wants to log a user in
    else if(dataFromChild.login) {
      //Sends a request to the auth api route with the users email and password
      fetch("/api/auth/", {method: "POST", headers:{"accepts": "application/json", "Content-Type": "application/json"}, body: JSON.stringify({"email": dataFromChild.email, "password": dataFromChild.password})})
      .then(res => res.json())
      .then(json => {
        //If the API responds with a token then we set that token in storage
        //Yes someone could intercept this and place a fake token in, but it would do no good since they need to send a VALID token with authenticated requests
        if (json.token){
          this.setState({
            leftPanelComponentInformationMessage: ""
          })
           setInStorage("PokePacksOnline", json.token);
           this.setState({
            leftPanelComponent: "PlayerStatsComponent",
            })
          //Get token from local storage and then fetch the users details from the database which is then set in state
          checkForLocalToken.checkForLocalToken()
          .then(returnObject => {
            if (returnObject != null){
              this.setState({
                token: returnObject.token,
                admin: returnObject.userObject.admin,
                userObject: returnObject.userObject,
                packListForceUpdate: this.state.packListForceUpdate + 1,
            })
            }
          })
        } else {
          this.setState({
            leftPanelComponentInformationMessage: "Invalid Credentials, Please Try Again"
          })
          console.log("Invalid credentials");
        }
      })
    } 
    //If the child wants to register a user
    else if (dataFromChild.register){
      //Similar to login with a post request send to users with username and password
      fetch("/api/users/", {method: "POST", headers:{"accepts": "application/json", "Content-Type": "application/json"}, body: JSON.stringify({"username": dataFromChild.username, "email": dataFromChild.email, "password": dataFromChild.password, "confirmPassword": dataFromChild.confirmPassword})})
      .then(res => res.json())
      .then(json => {
        if (json.token){
           this.setState({
             leftPanelComponent: "LoginComponent",
           })
        } else {
          console.log("Invalid credentials");
        }
      })
    }
    //If the child wants to delete a user
    else if (dataFromChild.delete){
      //Simple delete API request that deletes an account based on its token
      fetch("/api/auth/user/delete", {method: "GET", headers:{"x-auth-token": this.state.token}})
      .then(res => {
        setInStorage("PokePacksOnline", "");
        this.setState({
          token: "",
          userObject: {},
        })
        this.setState({
          leftPanelComponent: "LoginComponent",
        })
      })
    }
  }

  //The callback all components that use the left panel use to communicate with the parent (this)
  rightPanelComponentChildCallback = dataFromChild => {
    //if the child is telling the parent to load a new component
    if (dataFromChild.openedPack){
      this.setState({
        openedPackForceShopUpdate: this.state.openedPackForceShopUpdate + 1
      })
    } 
  }
  // ================================================================================

  //-------------------- renderPacks functions are used to map all of the packs to PackListComponents --------------------
  //Renders all the packs to the main screen
  renderPacks(packs) {
    //This is a method that will appear a lot throughout this website
    //Essentially its a loop through an array and you can then assign each element in that array to its own component, passing it in properties like name and code etc.
    //This means each pack in this case gets its own component and then the website is able to display a list of these components
    return packs.map(pack => <PackListComponent packListForceUpdate={this.state.packListForceUpdate} key={pack.code} code={pack.code} name={pack.name} cards={pack.cards} cost={pack.cost} level={pack.level} totalCards={pack.totalCards} filter={this.state.packFilter} callbackToParent={this.rightPanelComponentChildCallback}/>)
  }

  //Renders all the packs the user owns
  renderUserPacks(packs) {
    return packs.map(pack => <InventoryListComponent key={pack.code} code={pack.code} name={pack.name} cards={pack.cards} totalCards={pack.totalCards} filter={this.state.packFilter}/>)
  }
  // ================================================================================

  //Handles the filter at the top of the screen.
  //Whenever something in the input box changes the state is updated with the new filter
  handleInputChange = event => {
    this.setState({packFilter: event.target.value})
  }

  //Simply rendering the filter bar
  renderFilterBar(){
    if (this.state.rightPanelComponent == "InventoryListComponent" || this.state.rightPanelComponent == "PackListComponent"){
      return (
        <Form>
          <Form.Group controlId="cardFilter">
            <Form.Label style={{color: "white"}}>Filter By Card Name</Form.Label>
            <Form.Control type="string" placeholder="" onChange={this.handleInputChange}/>
          </Form.Group>
        </Form>
      );
    }
  }

  //The main render method
  //This is what is actually displaying things to the screen
  render() {
    const {packs} = this.state;
    return (
      <div className="App">
        <Styles>
          <NavbarRightPanelComponent rightPanelComponent={this.state.rightPanelComponent} callbackToParent={this.NavbarRightPanelComponentChildCallback} admin={this.state.admin}/>
          <Row style={{margin: "0 auto"}}>
            <Col>
              <NavbarLeftPanelComponent leftPanelComponent={this.state.leftPanelComponent} callbackToParent={this.NavbarLeftPanelComponentChildCallback}/>
              {this.leftPanelComponentToRender()}
            </Col>
            <Col style={{marginTop: "0.5rem"}} sm={8}>
              <Accordion>
                {this.renderFilterBar()}
                {this.rightPanelComponentToRender()}
              </Accordion>
            </Col>
          </Row>
        </Styles>
      </div>
    );
  }
}

export default App;
