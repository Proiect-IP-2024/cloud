import mysql from "mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pacient, User, UserToken } from "./modules/interfaces";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.json());

const PORT = process.env.USER_SERVER_PORT || 1001;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});


app.get("/user/getDateMedicale", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: Pacient) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT * FROM Date_medicale WHERE CNP_pacient = ?`,
                    [user.CNP_pacient],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("Date medicale not found");
                        }

                        const medic = rows[0];

                        conn.release();
                        return res.status(200).send({ medic });
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.post("/user/addDateMedicale", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: { ID_date_medicale: number, CNP_pacient: string, alergii: string, consultatii_cardiologice: string} | null = req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.ID_date_medicale && userData?.CNP_pacient)) {
            return res.status(400).send("Invalid data!");
        }

        pool.getConnection(async (error: any, conn) => {
            if (error) {
                return res.status(500).send("Connection error");
            }

            conn.query(
                `INSERT INTO Date_medicale SET ?`,
                {
                    ID_date_medicale: userData.ID_date_medicale,
                    CNP_pacient: userData.CNP_pacient,
                    alergii: userData.alergii,
                    consultatii_cardiologice: userData.consultatii_cardiologice
                },
                async (err, rows) => {
                    if (err) {
                        conn.release();
                        console.error(err);
                        return res.sendStatus(500);
                    }

                    conn.release();
                    return res.status(200).send("Medic added");
                }
            );
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});


app.get("/user/getConsultByPacient", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: Pacient) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT * FROM Consult WHERE CNP_pacient = ?`,
                    [user.CNP_pacient],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("Consulturi not found");
                        }

                        const medic = rows[0];

                        conn.release();
                        return res.status(200).send({ medic });
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});


app.listen(PORT, () => {
    return console.log(`\nAUTH server is listening at PORT: ${PORT}`);
  });
  