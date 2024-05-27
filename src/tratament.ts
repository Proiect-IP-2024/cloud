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




app.post("/user/addTratament", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: { id_tratament: number, CNP_pacient: string, tratament: string, data_emitere: Date, alte_detalii: string  } | null = req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.id_tratament && userData?.CNP_pacient)) {
            return res.status(400).send("Invalid data!");
        }

        pool.getConnection(async (error: any, conn) => {
            if (error) {
                return res.status(500).send("Connection error");
            }

            conn.query(
                `INSERT INTO Date_medicale SET ?`,
                {
                    id_tratament: userData.id_tratament,
                    CNP_pacient: userData.CNP_pacient,
                    tratament: userData.tratament,
                    data_emitere: userData.data_emitere
                },
                async (err, rows) => {
                    if (err) {
                        conn.release();
                        console.error(err);
                        return res.sendStatus(500);
                    }

                    conn.release();
                    return res.status(200).send("Tratament added");
                }
            );
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.post("/user/updateTratament", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const updateData: {
            id_tratament: number,
            bifat_supraveghetor: boolean,
            data_ora_bifare: Date,
            observatii_ingrijitor: string
        } | null = req.body?.updateData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(updateData && updateData.id_tratament !== undefined && updateData.bifat_supraveghetor !== undefined && updateData.data_ora_bifare && updateData.observatii_ingrijitor)) {
            return res.status(400).send("Invalid data!");
        }

        // No need to verify the token for this particular example, but you can add it if needed.

        pool.getConnection((error: any, conn) => {
            if (error) {
                return res.status(500).send("Connection error");
            }

            conn.query(
                `UPDATE Tratamente SET bifat_supraveghetor = ?, data_ora_bifare = ?, observatii_ingrijitor = ? WHERE id_tratament = ?`,
                [updateData.bifat_supraveghetor, updateData.data_ora_bifare, updateData.observatii_ingrijitor, updateData.id_tratament],
                (err, results) => {
                    if (err) {
                        conn.release();
                        console.error(err);
                        return res.sendStatus(500);
                    }

                    conn.release();
                    return res.status(200).send("Tratament updated");
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
  