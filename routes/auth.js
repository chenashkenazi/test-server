const Router = require('express-promise-router');
const userModel = require('../model/user');
const secure = require('server-security');
const router = new Router();

module.exports = router;

router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || ! password) {
        res.status(400);
        res.send("Missing email or password");
        return;
    }

    const users = await userModel.getUserByEmail(email);
    if (users.length === 0) {
        res.status(401);
        res.send("Bad username or password");
        return;
    }

    if (!secure.validatePasswordAge(users[0].password_modified_time)) {
        res.status(401);
        res.send("Password has expired. Please reset your password");
        return;
    }

    const passwordVerified = await secure.verifyPassword(password, users[0].password);
    if(!passwordVerified) {
        res.status(401);
        res.send("Bad username or password");
        return;
    }

    res.sendStatus(200);
});

router.post('/signup', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || ! password) {
        res.status(400);
        res.send("Missing email or password");
        return;
    }

    if (! await secure.validatePasswordOnSignup(password)) {
        res.status(400);
        res.send("Please supply a stronger password");
        return;
    }

    const users = await userModel.getUserByEmail(email);
    if (users.length > 0) {
        res.status(400);
        res.send("User already exists");
        return;
    }

    userModel.createUser(email, password).then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        next(err);
    })
})

router.post('/resetpassword', async (req, res, next) => {
    const email = req.body.email;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;

    if(!email || ! oldPassword || ! newPassword) {
        res.status(400);
        res.send("Missing email or password");
        return;
    }

    const users = await userModel.getUserByEmail(email);
    if (users.length === 0) {
        res.status(400);
        res.send("User not exists");
        return;
    }

    const userPasswordHistory = await userModel.getUserPasswordHistory(email);

    if (! await secure.validateResetPassword(oldPassword, users[0].password,
            users[0].password_modified_time, newPassword, userPasswordHistory)) {
        res.status(400);
        res.send("Error resetting password");
        return;
    }

    userModel.changeUserPassword(email, newPassword).then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        next(err);
    })
})

router.post('/forgotpassword', async (req, res, next) => {
    const email = req.body.email;

    if(!email) {
        res.status(400);
        res.send("Missing email");
        return;
    }

    const users = await userModel.getUserByEmail(email);
    if (users.length === 0) {
        res.status(400);
        res.send("User not exists");
        return;
    }

    const resetToken = await userModel.generateForgotPasswordToken(email);
    console.log(`Sending email to ${email} with resetToken ${resetToken}`);

    res.sendStatus(200);
})

router.post('/resetpassword-token', async (req, res, next) => {
    const email = req.body.email;
    const token = req.body.token;
    const newPassword = req.body.newpassword;

    if(! email || ! token || ! newPassword) {
        res.status(400);
        res.send("Missing email / token / password");
        return;
    }

    const users = await userModel.getUserByEmail(email);
    if (users.length === 0) {
        res.status(400);
        res.send("User not exists");
        return;
    }

    const userPasswordHistory = await userModel.getUserPasswordHistory(email);

    if (!users[0].forgot_password_token ||
            ! await secure.validateForgotPassword(token, users[0].forgot_password_token,
            newPassword, userPasswordHistory)) {
        res.status(400);
        res.send("Error resetting password with token");
        return;
    }

    userModel.changeUserPassword(email, newPassword).then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        next(err);
    })
})