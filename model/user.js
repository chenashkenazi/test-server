const secure = require('server-security');
const db = require('../db');

async function getUserByEmail(email) {
    const query = 'SELECT * FROM users where email = $1';
    const params = [email];
    const {rows} = await db.query(query, params);
    return rows
}

async function createUser(email, password) {
    const hashedPassword = await secure.hashPassword(password);

    let query = 'INSERT INTO users(email, password, password_modified_time) VALUES($1, $2, current_timestamp)';
    let params = [email, hashedPassword];
    const {rows} = await db.query(query, params);

    query = 'INSERT INTO password_history(email, password) VALUES($1, $2)';
    params = [email, hashedPassword];
    await db.query(query, params);
}

async function changeUserPassword(email, password) {
    const hashedPassword = await secure.hashPassword(password);

    let query = 'UPDATE users SET password = $2, password_modified_time = current_timestamp, forgot_password_token = NULL WHERE email = $1';
    let params = [email, hashedPassword];
    const {rows} = await db.query(query, params);

    query = 'INSERT INTO password_history(email, password) VALUES($1, $2)';
    params = [email, hashedPassword];
    await db.query(query, params);
}

async function getUserPasswordHistory(email) {
    const query = 'SELECT * FROM password_history where email = $1';
    const params = [email];
    const {rows} = await db.query(query, params);
    return rows
}

async function generateForgotPasswordToken(email) {
    const token = await secure.generateForgotPasswordToken();

    const query = 'UPDATE users SET forgot_password_token = $2 WHERE email = $1';
    const params = [email, token.hashedToken];
    const {rows} = await db.query(query, params);
    return token.resetToken;
}

module.exports = {
    getUserByEmail,
    createUser,
    changeUserPassword,
    getUserPasswordHistory,
    generateForgotPasswordToken
}