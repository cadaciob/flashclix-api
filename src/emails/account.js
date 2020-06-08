const sgMail = require('@sendgrid/mail')

sgMail.setApiKey('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')

const sendWelcomeEmail = (email, username) => {
    sgMail.send({
        to: email,
        from: 'welcome@flashclix.at',
        subject: 'Thanks for joining in!',
        text: `Welcome to flashclix app, ${username}. Let me know how you get along with the flashclix app.`
    })
}

const sendCancelationEmail = (email, username) => {
    console.log(email, username)
    sgMail.send({
        to: email,
        from: 'goodbye@flashclix.at',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${username}. I hope to see you back sometime soon.`
    })
}

const forgotPasswordEmail = (email, username, password) => {
    sgMail.send({
        to: email,
        from: 'forgotpassword@flashclix.at',
        subject: 'Reset password request!',
        text: `Hello ${username}. A request has been received that you forgot your password. 
        Your new password is ${password}. Now you can sign in with your new password.`
    })
    console.log(email, password, 'from email/account.js')
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
    forgotPasswordEmail
}