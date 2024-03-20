import mysql from "mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./modules/interfaces";

const app = express();

app.use(express.json());

const PORT = process.env.AUTH_SERVER_PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.post("/user/createUser", async (req: Request, res: Response) => {
  try {
    const userData: User | null = req.body?.userData;

    //Verify the request data is ok
    if (
      !(
        userData &&
        userData?.firstName &&
        userData?.lastName &&
        userData?.password &&
        userData?.email
      )
    ) {
      return res.status(400).send("Invalid data!");
    }

    pool.getConnection((error: any, conn) => {
      if (error) {
        return res.status(500).send("Connection error");
      }

      conn.query(
        `SELECT FirstName FROM users WHERE email = ? `,
        [userData.email],
        async (err, rows) => {
          conn.release();
          if (err) {
            console.error(err);
            return res.sendStatus(500);
          }

          if (rows[0] !== undefined) {
            return res.status(500).send("User already exists");
          }

          //hashing password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          //Insert user to database
          conn.query(
            `INSERT INTO users SET = ?`,
            {
              FirstName: userData.firstName,
              LastName: userData.lastName,
              Password: hashedPassword,
              Email: userData.email,
            },
            (error, rows) => {
              conn.release();
              if (error) {
                console.error(error);
                return res.sendStatus(500);
              }
              return res.sendStatus(201);
            }
          );
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  return console.log(`\nAUTH server is listening at PORT: ${PORT}`);
});
