//Importing the server module from socket.io
import { Server } from "socket.io";

//Sets up a variable to track click count
let clickCount = 0;

//creating the server to host poject
const io = new Server(3000, {
  //options
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//Method that waits for a connection from a user and sends the socket id 
io.on("connection", (socket) => {

  //Sets up a map object for taking in the names
  let nameMap = new Map();

  //Method when getFriendlyName message is emmitted the user
  //sends over the name they want set and pairs it to 
  //their user id in the map
  socket.on("getFriendlyName", (friendlyName) => {
    nameMap.set(socket.id, friendlyName);
  });

  //Method so when the user clicks the play button it will 
  //increment the click count by 1 then will create a variable 
  //for who clicked the button and get their name from their socket id pair
  //then will create a payload of the total clicks and the name as who clicked to send back 
  socket.on("click", () => {
    clickCount += 1;
    const whoClicked = nameMap.get(socket.id);
    const payload = {
      totalClicks: clickCount,
      whoClicked: whoClicked ?? socket.id
    };

    //Variable to make payload a string because it's easier for json objcts
    //and making it a string also helps with security so the user can't mess with anything 
    //they shouldn't change/break
    const payloadAsString = JSON.stringify(payload, (key, value) => {

      //If statement to see if a name was input and if not return undefined
      if (key === "friendlyName") {
        return undefined;
      }
      return value;
    });

    //Log what cam from click and payload to know it works right
    console.log("click", payloadAsString);

    //Method to emit back to users connected that someone clicked and 
    //send back the data of who clicked and total clicks
    io.emit("someoneClicked", payloadAsString);
  });


  //Method to recieve when someone reset the clicks 
  //it sets click count to 0 then sets a variable to 
  //grab the name from the name map using the users socket id 
  //to put the name set into the payload for who clicked 
  //then sets up/preps the updated payload for sending back
  socket.on("resetClicks", () => {
    clickCount = 0;
    const whoClicked = nameMap.get(socket.id);
    const payload = {
      totalClicks: clickCount,
      whoClicked: whoClicked ?? socket.id
    };

    //Again makes payload a string and checks for if a name is input in the map 
    //then returns a name or undefined if no value
    const payloadAsString = JSON.stringify(payload, (key, value) => {
      if (key === "friendlyName") {
        return undefined;
      }
      return value;
    });

    //Logs to console the info from the reset and oayload 
    //to make sure it works right
    console.log("resetClicks", payloadAsString);

    //Emits to the connected users that someone reset 
    //the clicks and sends over the updated payload 
    io.emit("someoneResetClicks", payloadAsString);

    //This will get the uer to emit to and emit 
    //the connectComplete so the user gets the payload on their ends
    io.to(socket.id).emit("connectComplete", payloadAsString);
  });
});

