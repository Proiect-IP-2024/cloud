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



app.get("/user/getUserData", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT first_name, last_name, email FROM Users WHERE email = ? `,
                    [user.email],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("User not found");
                        }

                        const user = rows[0];

                        conn.release();
                        return res.status(200).send({ user });
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.delete("/user/deleteUser", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `DELETE FROM Users WHERE email = ? `,
                    [user.email],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        conn.release();
                        return res.status(200).send("User deleted");
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.post("/user/setAdmin", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `INSERT INTO ADMIN SET ?`,
                    {
                        id: user.id,
                    },
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        conn.release();
                        return res.status(200).send("User is now admin");
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.delete("/user/removeAdmin", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `DELETE FROM ADMIN WHERE id = ?`,
                    [user.id],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        conn.release();
                        return res.status(200).send("User is no longer admin");
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.get("/user/isAdmin", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT * FROM ADMIN WHERE id = ?`,
                    [user.id],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(200).send({ isAdmin: false });
                        }

                        conn.release();
                        return res.status(200).send({ isAdmin: true });
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});



app.post("/user/changePassword", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: User | null = req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.password && userData?.newPassword)) {
            return res.status(400).send("Invalid data!");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", async (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT password_hash FROM Users WHERE email = ?`,
                    [user.email],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("User not found");
                        }

                        if (
                            !(await bcrypt.compare(userData.password, rows[0].password_hash))
                        ) {
                            conn.release();
                            return res.status(500).send("Invalid password");
                        }

                        const hashedPassword = await bcrypt.hash(userData.newPassword, 10);

                        conn.query(
                            `UPDATE Users SET password_hash = ? WHERE email = ?`,
                            [hashedPassword, user.email],
                            async (err, rows) => {
                                if (err) {
                                    conn.release();
                                    console.error(err);
                                    return res.sendStatus(500);
                                }

                                conn.release();
                                return res.status(200).send("Password changed");
                            }
                        );
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

// update user data
app.post("/user/updateUserData", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: User | null = req.body?.userData;
        var hashedPassword = null;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.firstName && userData?.lastName)) {
            return res.status(400).send("Invalid data!");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", async (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection(async (error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                if (userData?.newPassword) {
                    // vrerify if the old password is correct if user want to change password
                    conn.query(
                        `SELECT password_hash FROM Users WHERE id = ?`,
                        [user.id],
                        async (err, rows) => {
                            if (err) {
                                conn.release();
                                console.error(err);
                                return res.sendStatus(500);
                            }

                            if (rows[0] === undefined) {
                                conn.release();
                                return res.status(500).send("User not found");
                            }

                            if (
                                !(await bcrypt.compare(userData.password, rows[0].password_hash))
                            ) {
                                conn.release();
                                return res.status(500).send("Invalid password");
                            }
                            conn.release();
                        }
                    );

                    hashedPassword = await bcrypt.hash(userData.newPassword, 10);
                }

                //verify if user want to change password
                if (!hashedPassword) {
                    // update user data without password
                    conn.query(
                        `UPDATE Users SET first_name = ?, last_name = ?, email = ? WHERE id = ?`,
                        [userData.firstName, userData.lastName, userData.email, user.id],
                        async (err, rows) => {
                            if (err) {
                                conn.release();
                                console.error(err);
                                return res.sendStatus(500);
                            }

                            conn.release();
                            return res.status(200).send("User data updated");
                        }
                    );
                } else {
                    // update user data with password
                    conn.query(
                        `UPDATE Users SET first_name = ?, last_name = ?, email = ?, password_hash = ? WHERE id = ?`,
                        [
                            userData.firstName,
                            userData.lastName,
                            userData.email,
                            hashedPassword,
                            user.id,
                        ],
                        async (err, rows) => {
                            if (err) {
                                conn.release();
                                console.error(err);
                                return res.sendStatus(500);
                            }

                            conn.release();
                            return res.status(200).send("User data updated");
                        }
                    );
                }
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.post("/user/addMedic", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: { telefon: string } | null = req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (!(userData && userData?.telefon)) {
            return res.status(400).send("Invalid data!");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", async (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection(async (error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `INSERT INTO Medic SET ?`,
                    {
                        id: user.id,
                        telefon: userData.telefon,
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
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.get("/user/getMedicData", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT telefon FROM Medic WHERE id = ?`,
                    [user.id],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("Medic not found");
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

app.delete("/user/deleteMedic", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `DELETE FROM Medic WHERE id = ?`,
                    [user.id],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        conn.release();
                        return res.status(200).send("Medic deleted");
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.post("/user/addPacient", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userData: Pacient | null =
            req.body?.userData;

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        if (
            !(
                userData &&
                userData?.CNP_pacient &&
                userData?.id_medic &&
                userData?.CNP_pacient.length === 13 &&
                userData?.varsta_pacient &&
                userData?.adresa_pacient &&
                userData?.telefon_pacient &&
                userData?.profesie_pacient &&
                userData?.loc_munca_pacient
            )
        ) {
            return res.status(400).send("Invalid data!");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", async (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection(async (error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `INSERT INTO Pacient SET ?`,
                    {
                        id: user.id,
                        CNP_pacient: userData.CNP_pacient,
                        id_medic: userData.id_medic,
                        varsta_pacient: userData.varsta_pacient,
                        adresa_pacient: userData.adresa_pacient,
                        telefon_pacient: userData.telefon_pacient,
                        profesie_pacient: userData.profesie_pacient,
                        loc_munca_pacient: userData.loc_munca_pacient,

                    },
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        conn.release();
                        return res.status(200).send("Pacient added");
                    }
                );
            });
        });
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

app.get("/user/getPacientData", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("Invalid token");
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user: UserToken) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }

            pool.getConnection((error: any, conn) => {
                if (error) {
                    return res.status(500).send("Connection error");
                }

                conn.query(
                    `SELECT CNP_pacient, id_medic FROM Pacient WHERE id = ?`,
                    [user.id],
                    async (err, rows) => {
                        if (err) {
                            conn.release();
                            console.error(err);
                            return res.sendStatus(500);
                        }

                        if (rows[0] === undefined) {
                            conn.release();
                            return res.status(500).send("Pacient not found");
                        }

                        const pacient = rows[0];

                        conn.release();
                        return res.status(200).send({ pacient });
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
    return console.log(`\nUser server is listening at PORT: ${PORT}`);
});
