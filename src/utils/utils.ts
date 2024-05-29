import { UserToken } from "../modules/interfaces";
import { Connection } from "mysql";
import { BroadcastOperator, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

interface Response {
  ok: boolean;
  status?: number;
  message?: any;
}

interface ResponseUserType extends Response {
  userType: {
    isMedic: boolean;
    isAdmin: boolean;
    isIngrijitor: boolean;
    isPacient: boolean;
  };
}

const isAdmin = (user: UserToken, conn: any) => {
  return new Promise<Response>((resolve, reject) => {
    conn.query(
      `SELECT * FROM ADMIN WHERE id = ?`,
      [user.id],
      async (err, rows) => {
        if (err) {
          console.error(err);
          reject(500);
        }

        if (rows[0] === undefined) {
          resolve({ ok: false, status: 403, message: "Forbidden" });
        }

        resolve({ ok: true });
      }
    );
  });
};

const isMedic = (user: UserToken, conn: any) => {
  return new Promise<Response>((resolve, reject) => {
    conn.query(
      `SELECT id FROM Medic WHERE id = ?`,
      [user.id],
      async (err: Error, rows: any[]) => {
        if (err) {
          console.error(err);
          reject(500);
        }

        if (rows[0] === undefined) {
          resolve({ ok: false, status: 403, message: "Forbidden" });
        }

        resolve({ ok: true });
      }
    );
  });
};

const getUserType = (user: UserToken, conn: any) => {
  var userType = {
    isAdmin: false,
    isMedic: false,
    isIngrijitor: false,
    isPacient: false,
  };

  return new Promise<ResponseUserType>((resolve, reject) => {
    conn.query(
      `SELECT * FROM Admin WHERE id = ?`,
      [user.id],
      async (err, rows) => {
        if (err) {
          console.error(err);
          reject(500);
        }

        if (rows[0] === undefined) {
          userType.isAdmin = false;
        } else {
          userType.isAdmin = true;
          resolve({ ok: true, userType });
        }

        conn.query(
          `SELECT * FROM Medic WHERE id = ?`,
          [user.id],
          async (err: Error, rows: any[]) => {
            if (err) {
              console.error(err);
              reject(500);
            }

            if (rows[0] === undefined) {
              userType.isMedic = false;
            } else {
              userType.isMedic = true;
              resolve({ ok: true, userType });
            }

            conn.query(
              `SELECT id FROM Ingrijitor WHERE id = ?`,
              [user.id],
              async (err: Error, rows: any[]) => {
                if (err) {
                  console.error(err);
                  reject(500);
                }

                if (rows[0] === undefined) {
                  userType.isIngrijitor = false;
                } else {
                  userType.isIngrijitor = true;
                  resolve({ ok: true, userType });
                }

                conn.query(
                  `SELECT id FROM Pacient WHERE id = ?`,
                  [user.id],
                  async (err: Error, rows: any[]) => {
                    if (err) {
                      console.error(err);
                      reject(500);
                    }

                    if (rows[0] === undefined) {
                      userType.isPacient = false;
                    } else {
                      userType.isPacient = true;
                    }

                    resolve({ ok: true, userType });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

const getPacientData = async (pacientID: string, conn: any) => {
  var pacientData = null;

  return new Promise<Response>((resolve, reject) => {
    if (!pacientID) {
      reject({ ok: false, status: 500, message: "User not found" });
    }

    conn.query(
      `SELECT 
        Pacient.*, 
        Users.first_name, 
        Users.last_name, 
        Users.email
        FROM Pacient 
        JOIN Users ON Pacient.id = Users.id
        WHERE Pacient.id = ?`,
      [pacientID],
      async (err, rows) => {
        if (err) {
          conn.release();
          console.error(err);
          reject({ ok: false, status: 500 });
        }

        if (rows[0] === undefined) {
          conn.release();
          reject({ ok: false, status: 500, message: "User not found" });
        }

        pacientData = rows[0];

        conn.query(
          `SELECT
            Pacient.CNP_pacient,
            Date_medicale.*
            FROM Pacient
            JOIN Date_medicale ON Pacient.CNP_pacient = Date_medicale.CNP_pacient
            WHERE Pacient.id = ?`,
          [pacientID],
          async (err, rows_date_medicale) => {
            if (err) {
              conn.release();
              console.error(err);
              reject({ ok: false, status: 500 });
            }

            const date_medicale = rows_date_medicale[0];

            if (date_medicale) {
              pacientData = { ...pacientData, ...date_medicale };
            }

            conn.query(
              `SELECT
                Pacient.CNP_pacient,
                Consult.*
                FROM Pacient
                JOIN Consult ON Pacient.CNP_pacient = Consult.CNP_pacient
                WHERE Pacient.id = ?
              `,
              [pacientID],
              async (err, rows_date_consult) => {
                if (err) {
                  conn.release();
                  console.error(err);
                  reject({ ok: false, status: 500 });
                }

                const date_cosult = rows_date_consult[0];

                if (date_cosult) {
                  pacientData = { ...pacientData, consult: { ...date_cosult } };
                }

                conn.query(
                  `SELECT
                  Pacient.CNP_pacient,
                  Diagnostic.*
                  FROM Pacient
                  JOIN Diagnostic ON Pacient.CNP_pacient = Diagnostic.CNP_pacient
                  WHERE Pacient.id = ?
                  `,
                  [pacientID],
                  async (errr, rows_diagnostic) => {
                    if (errr) {
                      conn.release();
                      console.error(err);
                      reject({ ok: false, status: 500 });
                    }

                    const date_diagnostic = rows_diagnostic[0];

                    if (date_diagnostic) {
                      pacientData = {
                        ...pacientData,
                        diagnostic: { ...date_diagnostic },
                      };
                    }

                    conn.query(
                      `SELECT
                    Pacient.CNP_pacient,
                    Tratamente.*
                    FROM Pacient
                    JOIN Tratamente ON Pacient.CNP_pacient = Tratamente.CNP_pacient
                    WHERE Pacient.id = ?
                    `,
                      [pacientID],
                      async (errr, rows_tratamente) => {
                        if (errr) {
                          conn.release();
                          console.error(err);
                          reject({ ok: false, status: 500 });
                        }

                        const date_tratamente = rows_tratamente[0];

                        if (date_tratamente) {
                          pacientData = {
                            ...pacientData,
                            tratament: { ...date_tratamente },
                          };
                        }

                        conn.query(
                          `SELECT
                        Pacient.CNP_pacient,
                        Schema_medicamentatie.*
                        FROM Pacient
                        JOIN Schema_medicamentatie ON Pacient.CNP_pacient = Schema_medicamentatie.CNP_pacient
                        WHERE Pacient.id = ?
                        `,
                          [pacientID],
                          async (errr, rows_medicamentatie) => {
                            if (errr) {
                              conn.release();
                              console.error(err);
                              reject({ ok: false, status: 500 });
                            }

                            const date_medicamentatie = rows_medicamentatie[0];

                            if (date_medicamentatie) {
                              pacientData = {
                                ...pacientData,
                                medicament: { ...date_medicamentatie },
                              };
                            }

                            conn.query(
                              `SELECT
                            Pacient.CNP_pacient,
                            Recomadare_medic.*
                            FROM Pacient
                            JOIN Recomadare_medic ON Pacient.CNP_pacient = Recomadare_medic.CNP_pacient
                            WHERE Pacient.id = ?
                            `,
                              [pacientID],
                              async (errr, rows_recomandare) => {
                                if (errr) {
                                  conn.release();
                                  console.error(err);
                                  reject({ ok: false, status: 500 });
                                }

                                const date_recomandare = rows_recomandare[0];

                                if (date_recomandare) {
                                  pacientData = {
                                    ...pacientData,
                                    recomandare: { ...date_recomandare },
                                  };
                                }

                                conn.query(
                                  `SELECT
                                  Pacient.CNP_pacient,
                                  Istoric_Alerte_automate.*
                                  FROM Pacient
                                  JOIN Istoric_Alerte_automate ON Pacient.CNP_pacient = Istoric_Alerte_automate.CNP_pacient
                                  WHERE Pacient.id = ?
                                  `,
                                  [pacientID],
                                  async (errr, rows_alerta) => {
                                    if (errr) {
                                      conn.release();
                                      console.error(err);
                                      reject({ ok: false, status: 500 });
                                    }

                                    const date_alerta = rows_alerta[0];

                                    if (date_alerta) {
                                      pacientData = {
                                        ...pacientData,
                                        alerta_automata: { ...date_alerta },
                                      };
                                    }

                                    conn.query(
                                      `SELECT 
                                        Pacient.CNP_pacient,
                                        Senzor_data.*
                                        FROM Pacient
                                        JOIN Senzor_data ON Pacient.CNP_pacient = Senzor_data.CNP_pacient
                                        WHERE Pacient.id = ?
                                        `,
                                      [pacientID],
                                      async (errr, rows_senzor) => {
                                        if (errr) {
                                          conn.release();
                                          console.error(err);
                                          reject({ ok: false, status: 500 });
                                        }

                                        const date_senzor = rows_senzor[0];

                                        if (date_senzor) {
                                          pacientData = {
                                            ...pacientData,
                                            sensor_data: [{ ...date_senzor }],
                                          };
                                        }

                                        conn.release();

                                        resolve({
                                          ok: true,
                                          message: pacientData,
                                        });
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

const getPatientPulse = (
  CNP_pacient: number,
  conn: Connection,
  socket: BroadcastOperator<DefaultEventsMap, any>
) => {
  if (!socket) {
    console.log(socket);
    return false;
  }

  conn.query(
    "SELECT valoare_puls, valoare_temp, valoare_umiditate, valoare_lumina FROM Senzor_data WHERE CNP_pacient = ? ORDER BY timestamp DESC LIMIT 1",
    [CNP_pacient],
    (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return;
      }
      if (results.length > 0) {
        socket.emit("pulseUpdate", {
          CNP_pacient,
          sensor_data: results[0],
        });
      }
    }
  );
};
export { isMedic, isAdmin, getUserType, getPacientData, getPatientPulse };
