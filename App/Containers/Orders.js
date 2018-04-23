/*
  Created by Dimov Daniel
  Mobidonia
*/
import React, {Component} from "react";
import {View,TouchableOpacity,StyleSheet,ScrollView,AsyncStorage,FlatList,ActivityIndicator} from "react-native";
import Navbar from '@components/Navbar'
import firebase from '@datapoint/Firebase'
import css from '@styles/global'
import fun from '@functions/common'
import CartFunction from '@functions/cart'
import ScrollableTabView, {DefaultTabBar,ScrollableTabBar } from 'react-native-scrollable-tab-view';
import StepIndicator from '@components/StepIndicator';
import Smartrow from '@smartrow'
import PayPalPayment from "./PayPalPayment"
import { Text,FormLabel, FormInput, Button } from 'react-native-elements'
import Config from '../../config'
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import T from '@functions/translation'


export default class Orders extends Component {
  //The key extraxtor
  _keyExtractor = (item, index) => item.id+index;

  //The constructor
  constructor(props) {
    super(props);

    //Init state
    this.state = {
      items:[],
      animating: true

    }

    //Bind functions
    this.getOrders=this.getOrders.bind(this);
    this.renderItem=this.renderItem.bind(this);
  }

  //Component mount function
  componentDidMount(){

    //Reference to this
    var _this=this;

    //Get the user id
    CartFunction.getArtificalUserID(function(userID,error){
      _this.getOrders(userID);
    })
  }

  /**
  * createInfo - creates single order info row
  * @param {String} str1 - left part
  * @param {String} str2 - right part
  * @param {Boolean} isbold - is right part in bold
  */
  createInfo(str1,str2,isbold=false){
    return (
      <View style={css.layout.createInfoStr1}>
          <View style={{flex:1}}>
            <Text>{str1}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={{textAlign:"right",fontWeight:isbold?"bold":"normal"}}>{str2}</Text>
          </View>
        </View>)
  }

  /**
  * renderItem - render single order in the FlatList
  * @param {Object} data data to display
  */
  renderItem(data){
    return (
      <View style={css.layout.orderDisplayContainer}>
        <View style={css.layout.orderDisplaySubContainer}>
          <Text style={css.layout.orderDisplayText}>{"#"+data.item.id}</Text>
        </View>
        {this.createInfo("Status",data.item.status)}
        {this.createInfo("Date",moment(data.item.time).fromNow())}
        {this.createInfo("Total",data.item.total+" "+Config.paypal.currency,true)}
      </View>
      )
  }

  /**
  * getOrders - Get the orders of the user
  * @param {String} userID
  */
  getOrders(userID){
    //Get the meta data
    var path="/orders";

    var _this=this;
    console.log("Data point "+path);


    var db=firebase.firestore();
    var data = [];
    var ref=db.collection(path);
    ref=ref.where('userID', '==', userID)


    ref.get()
    .then(snapshot => {
      snapshot
        .docs
        .forEach(doc => {
          var objToAdd=JSON.parse(doc._document.data.toString());
          objToAdd.id=doc.id;
          console.log(objToAdd)
          data.push(objToAdd);


        });


        _this.setState({
            items:data.reverse(),
            animating:false
          })

    });
  }

  /**
  * renderIf - render a text label if there is no items
  * @param {Object} numItems
  */
  renderIf(numItems){
    console.log("This is the number of data "+numItems)
    if(numItems == 0 && this.state.animating == false){
       return (
          <Text style={css.layout.noItemsTextStyle}>{T.no_orders}</Text>
        )
    }
  }


  render() {
    return (
      <View style={css.layout.containerBackground,{flex:1}}>
          <Navbar navigation={this.props.navigation} isRoot={ true} showRightButton={false}  />
          {this.renderIf(this.state.items.length)}
          <FlatList
            data={this.state.items}
            keyExtractor={this._keyExtractor}
            renderItem={this.renderItem}
          />



        </View>
      )
  }

}
