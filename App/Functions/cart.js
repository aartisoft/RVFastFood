import {AsyncStorage} from "react-native";
import Config from '../../config'
import firebase from '@datapoint/Firebase'
import AppEventEmitter from "@functions/emitter"


/**
*
*      FAVORITES FUNCTIONS
*
*/

/*
* Add item in the properties
* @param {Object} object to insert
* @param {String} property, in what store
* @param {Function} callback
*/
async function addFavoritesContent(object,property,callback){
   getFavoritesContent(property, async function(data,error){
     if(error==false){
       var items=data;
       items.push(object);
       console.log(JSON.stringify(items.length));
       
       try {
           await AsyncStorage.setItem('@MySuperStore:'+property, JSON.stringify(items),function(done){
            AppEventEmitter.emit('favorites.refresh');
            getFavoritesContent(property,callback);
          });
        } catch (error) {
          // Error saving data
        }
     }
   })
}
exports.addFavoritesContent=addFavoritesContent;

/*
* remove item in the properties
* @param {String} id to delete
* @param {String} property, in what store
* @param {Function} callback
*/
async function removeFavoritesContent(id,property,callback){
   getFavoritesContent(property, async function(data,error){
     if(error==false){
       var items=data;
       var temp=[];
       for (var i = 0; i < items.length; i++) {
         currentItem=items[i];
         if(currentItem.id+""!=id+""){
          temp.push(currentItem);
         }
       }
       try {
           await AsyncStorage.setItem('@MySuperStore:'+property, JSON.stringify(temp),function(done){
            AppEventEmitter.emit('favorites.refresh');
            doWeHaveThisFavorite(id,property,callback);
          });
        } catch (error) {
          // Error saving data
        }
     }
   })
}
exports.removeFavoritesContent=removeFavoritesContent;


/*
* Add item in the properties
* @param {String} id to compare
* @param {String} property, in what store
* @param {Function} callback
*/
async function doWeHaveThisFavorite(id,property,callback){
   console.log("Do we have in propertyyy "+JSON.stringify(id));
   getFavoritesContent(property, async function(data,error){
     if(error==false){
       var items=data;
       var weHaveIt=false;
       for (var i = 0; i < items.length; i++) {
         currentItem=items[i];
         console.log("------ COMPARE ----- ")
         console.log(currentItem.id)
         console.log(id)
         if(currentItem.id+""==id+""){
          weHaveIt=true;
         }
         //TODO - do check
       }
       callback(weHaveIt);
      
     }
   })
}
exports.doWeHaveThisFavorite=doWeHaveThisFavorite;



/*
* Gets the content of the givven property
* @param {String} property, in what store
* @param callback
*/
async function getFavoritesContent(property,callback) {
  try {
    const value = await AsyncStorage.getItem('@MySuperStore:'+property);
    if (value !== null){
      // We have data!!
      console.log(value);
      callback(JSON.parse(value),false);
    }else{
      callback([],false);
    }
  } catch (error) {
    // Error retrieving data
    callback(error,true);
  }
}
exports.getFavoritesContent=getFavoritesContent;


/**
*
*      CART FUNCTIONS
*
*/

/*
* Add item in the Cart
* @param object object to insert
* @param callback
*/
async function addCartContent(object,callback){
   getCartContent(async function(data,error){
     if(error==false){
       var cart=data;
       cart.push(object);
       console.log(JSON.stringify(cart.length));
       
       try {
           await AsyncStorage.setItem('@MySuperStore:cart', JSON.stringify(cart),function(done){
            AppEventEmitter.emit('product.added');
            getCartContent(callback);
          });
        } catch (error) {
          // Error saving data
        }
     }
   })
}
exports.addCartContent=addCartContent;

/*
* Update item qty - or remove it
* @param {String} id object id to change
* @param {Number}  qty id to change
* @param {Function} callback
*/
async function updateQty(id,qty,callback){
   getCartContent(async function(data,error){
     if(error==false){
       var cart=data;
       var index=null;
       for (var i = 0; i < cart.length; i++) {
        //Just find it for now
        console.log("compare "+cart[i].id+" with "+id);
        if(cart[i].id==id){
          index=i;
          console.log("index is "+i);
        }
       }
       if(index!=null){
        if(qty!=0){
          //It is update, not delete
          console.log("Updtae qty to "+qty);
          cart[index].qty=qty;
        }else{
          //It is delete
          cart.splice(index, 1);
        }
       }
       console.log(JSON.stringify(cart));
       try {
           await AsyncStorage.setItem('@MySuperStore:cart', JSON.stringify(cart),function(done){
            getCartContent(callback);
          });
        } catch (error) {
          // Error saving data
        }
     }
   })
}
exports.updateQty=updateQty;

/*
* Gets the content of the Cart
* @param callback
*/
async function getCartContent(callback) {
  try {
    const value = await AsyncStorage.getItem('@MySuperStore:cart');
    if (value !== null){
      // We have data!!

      console.log(value);
      callback(JSON.parse(value),false);
    }else{
      callback([],false);
    }
  } catch (error) {
    // Error retrieving data
    callback(error,true);
  }
}
exports.getCartContent=getCartContent;

/*
* Delete cart
* @param callback
*/
async function cleanCart(callback){
   getCartContent(async function(data,error){
     if(error==false){
       var cart=[];
       try {
           await AsyncStorage.setItem('@MySuperStore:cart', JSON.stringify(cart),function(done){
            getCartContent(callback);
          });
        } catch (error) {
          // Error saving data
        }
     }
   })
}
exports.cleanCart=cleanCart;




/**
*
*      SHIPPING FUNCTIONS
*
*/

/*
* addShipingInfo
* @param object object to insert
* @param callback
*/
async function addShipingInfo(object,callback){
   await AsyncStorage.setItem('@MySuperStore:shipping', JSON.stringify(object),function(done){
            getShipingInfo(callback);
          });
}
exports.addShipingInfo=addShipingInfo;


/*
* getShipingInfo
* @param callback
*/
async function getShipingInfo(callback) {
  try {
    const value = await AsyncStorage.getItem('@MySuperStore:shipping');
    if (value !== null){
      // We have data!!
      console.log(value);
      callback(JSON.parse(value),false);
    }else{
      callback({},false);
    }
  } catch (error) {
    // Error retrieving data
    callback(error,true);
  }
}
exports.getShipingInfo=getShipingInfo;



/**
*
*      PAYMENT  FUNCTIONS
*       and order saving
*
*/

async function getShopifyUrlParameters(callback) {

  /**
   * 
   * var remoteAdd="";
                for(var i=0;i<orderLength;i++){
                    if(order[i].prices[order[i].selectedIndex].id){
                        remoteAdd+=order[i].prices.length>0 ? (order[i].prices[order[i].selectedIndex].id+":"+order[i].selectedQty+",") : "";
                    }

                }
                var flname=name.textField.value.split(" ");
                var fname=name.textField.value;
                var lname="";
                if(flname.length>1){
                   fname= flname[0];
                   lname=flname[1]
                }

                var url=VARS.shopifyDomain+"/cart/"+remoteAdd;
                    url+="?checkout[shipping_address][phone]="+phone.textField.value
                    url+="&checkout[shipping_address][address1]="+address.textField.value
                    url+="&checkout[shipping_address][first_name]="+fname;
                    url+="&checkout[shipping_address][last_name]="+lname;
                    url+="&checkout[email]="+notes.textField.value;
                    url=url.replace("//","/");
                    VARS.info("Add to card");
                    VARS.info(url);

   */

  getCartContent(function(data,e){
    var remoteAdd=""
    for (var i = 0; i < data.length; i++) {
      var order=data[i];
      remoteAdd+=(order.variant_id+":"+order.qty+(i==data.length-1?"":","));
    }
    
   

    getShipingInfo(function(rawShiipingInfo,theError){

      var flname=rawShiipingInfo.recipient_name.split(" ");
      var fname=rawShiipingInfo.recipient_name;
      var lname="";
      if(flname.length>1){
         fname= flname[0];
         lname=flname[1]
      }
      

      remoteAdd+="?checkout[shipping_address][phone]="+rawShiipingInfo.phone
      remoteAdd+="&checkout[shipping_address][address1]="+rawShiipingInfo.line1
      remoteAdd+="&checkout[shipping_address][first_name]="+fname;
      remoteAdd+="&checkout[shipping_address][last_name]="+lname;
      remoteAdd+="&checkout[email]="+rawShiipingInfo.email;
      callback(remoteAdd);
    })
  })
}
exports.getShopifyUrlParameters=getShopifyUrlParameters;

/*
* getPayPalItem - gets data ready for paypal
* @param callback
*/
async function getPayPalItem(callback){
  getCartContent(function(data,e){
    var subTotal=0;
    var items=[];
    for (var i = 0; i < data.length; i++) {
      var item=data[i];
      items.push({
              name: item.name,
              quantity: item.qty,
              price: item.price,
              //tax: ((item.price/100)*Config.tax)+"",
              sku: '/',
              currency: Config.paypal.currency
          })
          subTotal+=(item.qty*item.price);
    }

    getShipingInfo(function(rawShiipingInfo,theError){

      var shiipingInfo={
            recipient_name: rawShiipingInfo.recipient_name,
            line1: rawShiipingInfo.line1,
            phone: rawShiipingInfo.phone,
            state:rawShiipingInfo.state,
            country_code: rawShiipingInfo.country_code,
            postal_code: rawShiipingInfo.postal_code,
            city: rawShiipingInfo.city,
          }
      order = [
        {
            amount: {
                total: subTotal,//(subTotal+((subTotal/100)*Config.tax))+"",
                currency: Config.paypal.currency,
                details: {
                    subtotal:subTotal,
                    //tax: ((subTotal/100)*Config.tax),
                    shipping:0

                }
            },
            payment_options: {allowed_payment_method: 'INSTANT_FUNDING_SOURCE'},
            item_list: {items: items,shipping_address:shiipingInfo},
            }
        ];
        callback(order);
    })
  })
}
exports.getPayPalItem=getPayPalItem;

/*
* saveOrderInFirebase - creates and order in firebase
* @param callback
*/
async function saveOrderInFirebase(callback){
  //TODO Use pregenerated user id
   getArtificalUserID(async function(userID,errorUser){
      getCartContent(async function(cart,errorCart){
      getShipingInfo(async function(shipping,errorCart){
        console.log("UserID: "+userID);
        console.log("Cart: "+JSON.stringify(cart));
        console.log("Shipping: "+JSON.stringify(shipping));
        var order={
          userID:userID,
          time:firebase.firestore.FieldValue.serverTimestamp(),
          status:"Just created",
          delivery:{
            name:shipping.recipient_name,
            address:shipping.line1,
            phone:shipping.phone,
            email:shipping.email,
            notes:shipping.notes,
          }
        }

        //Now form the cartItem
        var cartItems=[];
        var total=0;
        for (var i = 0; i < cart.length; i++) {
          curentCartItem=cart[i];
          var orderItem={
            price:curentCartItem.price,
            variant:curentCartItem.title,
            name:curentCartItem.name,
            quantity:curentCartItem.qty,
            id:curentCartItem.id,
            image:curentCartItem.image,
          }
          total+=(curentCartItem.qty*curentCartItem.price);

          for (var j = 0; j < curentCartItem.productOptions.length; j++) {
            var currentOption=curentCartItem.productOptions[j];
            orderItem[currentOption.name]=curentCartItem[currentOption.id];
          }

          cartItems.push(orderItem);
        }
        order.order=cartItems;
        order.total=total;

        console.log("********* ORDER ***********");
        console.log(JSON.stringify(order));

        // Add a new document with a generated id.
        var db=firebase.firestore();
        var newID=new Date().getTime()+"";
        db.collection("orders").doc(new Date().getTime()+"").set(order)
        .then(function(docRef) {
            console.log("Document written with ID: ", newID);
            sengGridEmail(newID,cart,shipping,total,callback)
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

      })
     })
  })


}
exports.saveOrderInFirebase=saveOrderInFirebase;



/**
* SEND GRID SEND
*/
function sengGridEmail(orderID,cart,shipping,subTotal,callback){

  var message="\nOrder #"+orderID+"\n=============\n";

  //Iterate the messages
   cart.map((section,i) => {
     message+=(section.name+"\n");
     message+=("Qty:"+section.qty+"\n");
     message+=("Price:"+section.qty+" x "+section.price+"\n");
     message+=("-------------\n");
   })
   message=="\n=============\n";

   message+=("TOTAL:"+subTotal+"\n\n\n\n")

   message+="Name:    "+shipping.recipient_name+"\n";
   message+="Phone:   "+shipping.phone+"\n";
   message+="Email:   "+shipping.email+"\n";
   message+="Address: "+shipping.line1+"\n";
   message+="Notes:   "+shipping.notes+"\n";

   fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization':'Bearer '+Config.SENDGRID_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
      "personalizations": [
        {
          "to": [
            {
              "email": Config.sendToEmail
            }
          ],
          "subject": "New order from "+shipping.recipient_name
        }
      ],
      "from": {
        "email": shipping.email
      },
      "content": [
        {
          "type": "text",
          "value": message
        }
      ]
    })
  }).then((response)=>{
    cleanCart(callback)
  })
}


/**
*
*      USER ACCOUNT FUNCTIONS
*
*/


function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/*
* getArtificalUserID - creates / returns user id
* @param callback
*/
async function getArtificalUserID(callback) {
  try {
    const value = await AsyncStorage.getItem('@MySuperStore:userID');
    if (value !== null){
      // We have data!!
      console.log(value);
      callback(value,false);
    }else{
      var newUserToken=makeid();
      await AsyncStorage.setItem('@MySuperStore:userID', newUserToken,function(done){
            callback(newUserToken,false);
          });
    }
  } catch (error) {
    // Error retrieving data
    callback(error,true);
  }
}
exports.getArtificalUserID=getArtificalUserID;
