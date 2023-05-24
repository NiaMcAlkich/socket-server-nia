import { Server } from "socket.io";

let clickCount = 0;

const io = new Server(3000, {
  //options
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  let nameMap = new Map();

  socket.on("getName", (name) => {
    nameMap.set(socket.id, name);
  });

  socket.on("click", () => {
    clickCount += 1;
    const whoClicked = nameMap.get(socket.id);
    const payload = {
      totalClicks: clickCount,
      whoClicked: whoClicked
    };
    const payloadAsString = JSON.stringify(payload, (key, value) => {
      if (key === "name") {
        return undefined;
      }
      return value;
    });
    console.log("click", payloadAsString);
    io.emit("someoneClicked", payloadAsString);
  });
  
  socket.on("resetClicks", () => {
    clickCount = 0;
    const whoClicked = nameMap.get(socket.id);
    const payload = {
      totalClicks: clickCount,
      whoClicked: whoClicked
    };
    const payloadAsString = JSON.stringify(payload, (key, value) => {
      if (key === "name") {
        return undefined;
      }
      return value;
    });
    console.log("resetClicks", payloadAsString);
    io.emit("someoneResetClicks", payloadAsString);
    io.to(socket.id).emit("connectComplete", payloadAsString);
  });
});