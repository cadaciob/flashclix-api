const mongoose = require("mongoose")
const Schema = mongoose.Schema

const flashcardsetSchema = new Schema({
    flashcardsets: {
        cardQuestion: {
            type: String,
        },
        cardAnswer: {
            type: String,
        },
        updated_At: {
            type: Date,
            default: Date.now
        }
    },
}, {
    timestamps: true
})

const Flashcardset = mongoose.model("Flashcardset", flashcardsetSchema)

module.exports = Flashcardset