import { UserToken } from "../modules/interfaces";

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
    }
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
                    resolve({ ok: false, status: 403, message: 'Forbidden' });
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
                    resolve({ ok: false, status: 403, message: 'Forbidden' });
                }

                resolve({ ok: true });
            }
        );

    });
}


const getUserType = (user: UserToken, conn: any) => {

    var userType = { isAdmin: false, isMedic: false, isIngrijitor: false, isPacient: false };

    return new Promise<ResponseUserType>((resolve, reject) => {
        conn.query(
            `SELECT * FROM ADMIN WHERE id = ?`,
            [user.id],
            async (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(500);
                }

                if (rows[0] === undefined) {
                    userType.isAdmin = false;
                }


                conn.query(
                    `SELECT id FROM Medic WHERE id = ?`,
                    [user.id],
                    async (err: Error, rows: any[]) => {
                        if (err) {
                            console.error(err);
                            reject(500);
                        }

                        if (rows[0] === undefined) {
                            userType.isMedic = false;
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
                                        }

                                        resolve({ ok: true, userType });
                                    }
                                );

                            }
                        );

                    }
                );
            });
    });
}

export {
    isMedic,
    isAdmin,
    getUserType
}