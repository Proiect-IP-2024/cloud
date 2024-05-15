import mysql from "mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./modules/interfaces";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

const PORT = process.env.AUTH_SERVER_PORT || 3000;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
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
        `SELECT email FROM Users WHERE email = ? `,
        [userData.email],
        async (err, rows) => {
          if (err) {
            conn.release(); // Release connection in case of error
            console.error(err);
            return res.sendStatus(500);
          }

          if (rows[0] !== undefined) {
            conn.release(); // Release connection if user already exists
            return res.status(500).send("User already exists");
          }

          //hashing password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          //Insert user to database
          conn.query(
            `INSERT INTO Users SET ?`, // Removed the equal sign after SET
            {
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              password_hash: hashedPassword,
            },
            (error, rows) => {
              conn.release(); // Release connection after second query
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

app.post("/user/login", async (req: Request, res: Response) => {
  try {
    const userData: User | null = req.body?.userData;

    //Verify the request data is ok
    if (!(userData && userData?.password && userData?.email)) {
      return res.status(400).send("Invalid data!");
    }

    pool.getConnection((error: any, conn) => {
      if (error) {
        return res.status(500).send("Connection error");
      }

      conn.query(
        `SELECT * FROM Users WHERE email = ? `,
        [userData.email],
        async (err, rows) => {
          if (err) {
            conn.release(); // Release connection in case of error
            console.error(err);
            return res.sendStatus(500);
          }

          if (rows[0] === undefined) {
            conn.release(); // Release connection if user already exists
            return res.status(500).send("User not found");
          }

          const user = rows[0];

          //Check if password is correct
          if (!(await bcrypt.compare(userData.password, user.password_hash))) {
            conn.release(); // Release connection if user already exists
            return res.status(500).send("Invalid password");
          }

          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
            {
              expiresIn: "1h",
            }
          );

          conn.release(); // Release connection after second query
          return res.status(200).send({ token });
        }
      );
    });
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/refreshToken", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
      if (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(403).send("Invalid token");
        }

        const newToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || "secret",
          {
            expiresIn: "1h",
          }
        );
        return res.status(200).send({ token: newToken });
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "1h",
        }
      );

      return res.status(200).send({ token: newToken });
    });
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  return console.log(`\nAUTH server is listening at PORT: ${PORT}`);
});
