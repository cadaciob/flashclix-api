const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Flashcard = require('./flashcard')

const generator = require('generate-password')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        },
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"!')
            }
        }
    },
    // birthdate: {
    //     type: Date,
    //     required: true
    // },
    birthdate: {
        type: String,
        required: true,
        default: new Date()
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 10) {
                throw new Error('Sorry, you have to be 10 years old or older to register!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('flashcards', {
    ref: 'Flashcard',
    localField: '_id',
    foreignField: 'createdBy'
})

// hiding data 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisisourdiplomathesis')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByUserEmailPassword = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to signin')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to signin')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user flashcards when user is removed
userSchema.pre('remove', async function (next) {
    const user = this

    await Flashcard.deleteMany({ createdBy: user._id })

    next()
})


const { forgotPasswordEmail } = require('../emails/account')

// 
userSchema.statics.findByUserEmail = async (email) => {
    const generatePassword = generator.generate({
        length: 12,
        numbers: true
    })
 
    const pw = generatePassword
    const user = await User.findOne({ email })
    const username = user.username

    forgotPasswordEmail(email, username, generatePassword)

    console.log(user.password, '1')
    user.password = pw
    await user.save()

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User