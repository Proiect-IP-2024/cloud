import mysql from "mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pacient, Recomandare, User, UserToken } from "./modules/interfaces";
import { getUserType, isMedic } from "./utils/utils";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");
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

    // Decode the token to get the payload without verifying it
    const decodedToken = jwt.decode(token) as UserToken;

    if (!decodedToken) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          if (err.name !== "TokenExpiredError") {
            return res.status(403).send("Invalid token");
          }
          
          // Token is expired, create a new one using the decoded payload
          const newToken = jwt.sign(
            { id: decodedToken.id, email: decodedToken.email },
            process.env.JWT_SECRET || "secret",
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).send({ token: newToken });
        }

        // Token is valid, create a new one using the verified payload
        const newToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || "secret",
          {
            expiresIn: "1h",
          }
        );

        return res.status(200).send({ token: newToken });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});


app.get("/user/getUserData", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `INSERT INTO Admin SET ?`,
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
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
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/getUserType", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection(async (error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          const userTypeResp = await getUserType(user, conn);

          if (userTypeResp.ok) {
            conn.release();
            return res.status(200).send(userTypeResp.userType);
          } else {
            conn.release();
            if (
              userTypeResp.status &&
              userTypeResp.userType &&
              userTypeResp.message
            ) {
              return res.status(userTypeResp.status).send({
                userType: userTypeResp.userType,
                message: userTypeResp.message,
              });
            } else {
              return res.status(403).send("Forbidden");
            }
          }
        });
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
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
                !(await bcrypt.compare(
                  userData.password,
                  rows[0].password_hash
                ))
              ) {
                conn.release();
                return res.status(500).send("Invalid password");
              }

              const hashedPassword = await bcrypt.hash(
                userData.newPassword,
                10
              );

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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
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
                  !(await bcrypt.compare(
                    userData.password,
                    rows[0].password_hash
                  ))
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
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
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.post("/user/addPacient", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userData: Pacient | null = req.body?.userData;

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    if (
      !(
        userData &&
        userData?.CNP_pacient &&
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
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
      }
    );
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

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `SELECT CNP_pacient, id_medic,varsta_pacient,adresa_pacient,	telefon_pacient,	profesie_pacient,	loc_munca_pacient FROM Pacient WHERE id = ?`,
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
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.delete("/user/deletePacient", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `DELETE FROM Pacient WHERE id = ?`,
            [user.id],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              conn.release();
              return res.status(200).send("Pacient deleted");
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.post("/user/addIngrijitor", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection(async (error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `INSERT INTO Ingrijitor SET ?`,
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
              return res.status(200).send("Ingrijitor added");
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/getIngrijitorData", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `SELECT * FROM Ingrijitor WHERE id = ?`,
            [user.id],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              if (rows[0] === undefined) {
                conn.release();
                return res.status(500).send("Ingrijitor not found");
              }

              const ingrijitor = rows[0];

              conn.release();
              return res.status(200).send({ ingrijitor });
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.delete("/user/deleteIngrijitor", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `DELETE FROM Ingrijitor WHERE id = ?`,
            [user.id],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              conn.release();
              return res.status(200).send("Ingrijitor deleted");
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.post("/user/addMedicToPacient", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userData: { id_pacient: number } | null = req.body?.userData;

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    if (!(userData && userData?.id_pacient)) {
      return res.status(400).send("Invalid data!");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection(async (error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `UPDATE Pacient SET id_medic = ? WHERE id = ? `,
            [user.id, userData.id_pacient],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              conn.release();
              return res.status(200).send("Medic added to pacient");
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/isTokenValid", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        return res.status(200).send("Token is valid");
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.post("/user/setRecomandareMedic", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userData: Recomandare | null = req.body?.userData;

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    if (
      !(
        userData &&
        userData?.id_recomandare &&
        userData?.CNP_pacient &&
        userData?.tip_recomandare &&
        userData?.durata_zilnica &&
        userData?.alte_indicatii &&
        userData?.tratamente
      )
    ) {
      return res.status(400).send("Invalid data!");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection(async (error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          const isMedicResp = await isMedic(user, conn);

          if (!isMedicResp) {
            conn.release();
            return res.status(403).send("User is not medic");
          }

          conn.query(
            `Insert INTO Recomadare_medic SET ? `,
            {
              id_recomandare: userData.id_recomandare,
              CNP_pacient: userData.CNP_pacient,
              tip_recomandare: userData.tip_recomandare,
              durata_zilnica: userData.durata_zilnica,
              alte_indicatii: userData.alte_indicatii,
              tratamente: userData.tratamente,
            },
            //[user.id],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              conn.release();
              return res.status(200).send("Recomandare added");
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/getRecomandareMedic", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection((error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          conn.query(
            `SELECT recomandare FROM Pacient WHERE id = ?`,
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

              const recomandare = rows[0];

              conn.release();
              return res.status(200).send({ recomandare });
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get("/user/getAssignedPacientList", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log(token);
    if (!token) {
      return res.status(400).send("Invalid token");
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
      async (err, user: UserToken) => {
        if (err) {
          return res.status(403).send("Invalid token");
        }

        pool.getConnection(async (error: any, conn) => {
          if (error) {
            return res.status(500).send("Connection error");
          }

          const isMedicResp = await isMedic(user, conn);

          if (!isMedicResp) {
            conn.release();
            return res.status(403).send("User is not medic");
          }

          conn.query(
            `SELECT Pacient.*, Users.first_name, Users.last_name, Users.email 
             FROM Users
             JOIN Pacient ON Users.id = Pacient.id
             WHERE Pacient.id_medic = ?`,
            [user.id],
            async (err, rows) => {
              if (err) {
                conn.release();
                console.error(err);
                return res.sendStatus(500);
              }

              conn.release();
              return res.status(200).send({ pacientList: rows });
            }
          );
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

app.get(
  "/user/getUnassignedPacientList",
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      console.log(token);
      if (!token) {
        return res.status(400).send("Invalid token");
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET || "secret",
        async (err, user: UserToken) => {
          if (err) {
            return res.status(403).send("Invalid token");
          }

          pool.getConnection(async (error: any, conn) => {
            if (error) {
              return res.status(500).send("Connection error");
            }

            const isMedicResp = await isMedic(user, conn);

            console.log(isMedicResp);

            if (!isMedicResp.ok) {
              conn.release();
              return res.status(403).send("User is not medic");
            }

            conn.query(
              `SELECT Pacient.*, Users.first_name, Users.last_name, Users.email 
             FROM Pacient
             JOIN Users ON Pacient.id = Users.id
             WHERE Pacient.id_medic IS NULL`,
              async (err, rows) => {
                if (err) {
                  conn.release();
                  console.error(err);
                  return res.sendStatus(500);
                }

                conn.release();
                return res.status(200).send({ pacientList: rows });
              }
            );
          });
        }
      );
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
  }
);

app.listen(PORT, () => {
  return console.log(`\nAUTH server is listening at PORT: ${PORT}`);
});
