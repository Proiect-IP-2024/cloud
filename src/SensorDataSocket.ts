import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import mysql from "mysql";
import { getPatientPulse } from "./utils/utils";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your React app's URL
    methods: ["GET", "POST"]
  }
});

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting sensor socket to MySQL database:", err);
    throw err;
  }
});

interface JoinRoomData {
  CNP_pacient: number;
}

const patientRooms: Set<number> = new Set();

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (data: JoinRoomData) => {
    console.log("data:", data);
    const { CNP_pacient } = data;
    console.log(`Client joined room for patient ${CNP_pacient}`);
    socket.join(`patient-${CNP_pacient}`);

    // Add patientId to the set of active patient rooms
    patientRooms.add(CNP_pacient);

    // Send initial pulse data when the client joins the room
    getPatientPulse(CNP_pacient, db, io.to(`patient-${CNP_pacient}`));
  });

  socket.on("leaveRoom", (data: JoinRoomData) => {
    const { CNP_pacient } = data;
    console.log(`Client left room for patient ${CNP_pacient}`);
    socket.leave(`patient-${CNP_pacient}`);

    // Remove patientId from the set of active patient rooms
    patientRooms.delete(CNP_pacient);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Polling function to fetch data every 5 seconds
setInterval(() => {
  patientRooms.forEach(async (CNP_pacient) => {
    const room = io.sockets.adapter.rooms.get(`patient-${CNP_pacient}`);
    if (room && room.size > 0) {
      getPatientPulse(CNP_pacient, db, io.to(`patient-${CNP_pacient}`));
    } else {
      patientRooms.delete(CNP_pacient);
    }
  });
}, 5000);

server.listen(process.env.SensorServerPort || 4000, () => {
  console.log(
    `Sensor socket listening on port ${process.env.SensorServerPort || 4000}`
  );
});
