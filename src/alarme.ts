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



  app.post("/user/setAlarmConfig", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData:{ id_configurare_alerta: number, id_medic:number, CNP_pacient: string, umiditate_valoare_maxima:number, temperatura_valoare_maxima:number, puls_valoare_maxima:number, puls_valoare_minima:number, umiditate_valoare_minima:number, temperatura_valoare_minima:number } | null= req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }


        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.id_configurare_alerta && userData?.CNP_pacient)) {
            return res.status(400).send("Invalid data!");
        }

        pool.getConnection(async (error: any, conn) => {
            if (error) {
                return res.status(500).send("Connection error");
            }


                conn.query(
                    `INSERT INTO Configurare_Alerta SET ?`,
                    {
                        id_configurare_alerta: userData.id_configurare_alerta,
                        id_medic: userData.id_medic,
                        CNP_pacient: userData.CNP_pacient,
                        umiditate_valoare_maxima: userData.umiditate_valoare_maxima,
                        temperatura_valoare_maxima: userData.temperatura_valoare_maxima,
                        puls_valoare_maxima: userData.puls_valoare_maxima,
                        puls_valoare_minima: userData.puls_valoare_minima,
                        umiditate_valoare_minima: userData.umiditate_valoare_minima,
                        temperatura_valoare_minima: userData.temperatura_valoare_minima

                    },                             
                        async (err, rows) => {
                    if (err) {
                        conn.release();
                        console.error(err);
                        return res.sendStatus(500);
                    }

                    conn.release();
                    return res.status(200).send("Date configurare added");
                }
            );
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});



app.get("/user/getConfigurareAlertaByPacient", async (req: Request, res: Response) => {
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
                    `SELECT * FROM Configurare_Alerta WHERE CNP_pacient = ?`,
                    [user.CNP_pacient],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("Configurare not found");
                        }

                        const configurare = rows[0];

                        conn.release();
                        return res.status(200).send({configurare });
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});


// Endpoint to get alarm history for a patient
app.get("/user/getAlarmHistory", async (req: Request, res: Response) => {
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
                    `SELECT * FROM Istoric_Alerte_automate WHERE CNP_pacient = ?`,
                    [user.CNP_pacient],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("No alarm history found");
                        }

                        const alarme = rows[0];

                        conn.release();
                        return res.status(200).send({ alarme });
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
  