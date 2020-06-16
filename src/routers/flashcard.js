const express = require('express') 
const Flashcard = require('../models/flashcard')
const auth = require('../middleware/auth') 

const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router() 

// for testing purpose only
router.get('/testflashcard', (req, res) => {
  res.send('From a new file ./routers/flashcard.js') 
})

//create flashcard
router.post('/flashcards', auth, async (req, res) => {

  const flashcard = new Flashcard({
    ...req.body,
    createdBy: req.user._id
  })

  try {
    await flashcard.save() 
    res.status(201).send(flashcard) 
  } catch (error) {
    res.status(400).send(error) 
  }
})

router.get('/flashcardset', async (req, res) => {
  const _id = req.params.id 

  try {
  const flashcardset = await Flashcard.findOne( { cardQuestion: 'Q1'} )
    //console.log(flashcardset.flashcardsets)
    console.log(flashcardset.flashcardsets[0])

    //res.send(flashcardset.flashcardsets)
    res.send(flashcardset.flashcardsets)

    console.log(newSet)
  } catch (error) {
    res.status(500).send(error) 
  }
}) 

// read / fetch all flashcards
router.get('/flashcards', auth, async (req, res) => {
  try {
    //const flashcard = await Flashcard.find({ createdBy: req.user._id }) 
    
    await req.user.populate('flashcards').execPopulate()
    res.send(req.user.flashcards) 
  } catch (error) {
    res.status(500).send()
  }
}) 

// read / fetch flashcards by its id
router.get('/flashcards/:id', auth, async (req, res) => {
  const _id = req.params.id 

  try {
    const flashcard = await Flashcard.findOne({ _id, createdBy: req.user._id }) 

    if (!flashcard) {
      return res.status(404).send() 
    }

    res.send(flashcard) 
  } catch (error) {
    res.status(500).send() 
  }
})

// update flashcard by its user
router.patch('/flashcards/:id', auth, async (req, res) => {
  const flashcardId = req.params.id 

  const updates = Object.keys(req.body) 
  const allowedUpdates = [
    'title',
    'flashcardset',
    'tags','cardQuestion',
    'cardAnswer', 'cardPicture']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Invalid updates!'
    }) 
  }

  try {
    
    //const flashcard = await Flashcard.findById(flashcardId)
    const flashcard = await Flashcard.findOne({ _id: flashcardId, createdBy: req.user._id })

    if (!flashcard) {
      return res.status(404).send() 
    }

    updates.forEach((update) => flashcard[update] = req.body[update])
    
    await flashcard.save()

    res.send(flashcard)
  } catch (error) {
    res.status(400).send()
  }
})

// add flashcard to set
router.patch('/addflashcard/:id', auth, async (req, res) => {
  const flashcardId = req.params.id

  const {cardQuestion,cardAnswer} = req.body 
  if(!cardQuestion || !cardAnswer){
      return  res.status(422).send({ error:"Plase add all the fields" })
    }

  try {
    //const flashcard = await Flashcard.findByIdAndUpdate(_id, req.body) 
    const flashcard = await Flashcard.findOne({  _id: flashcardId, createdBy: req.user._id })
    //const flashcardSaved = flashcard.flashcardsets 
    console.log(flashcard)
    //console.log(flashcardSaved)

    if (!flashcard) {
      return res.status(404).send() 
    }

    flashcard.flashcardset.push({
      cardQuestion: req.body.cardQuestion,
      cardAnswer: req.body.cardAnswer
    })

    await flashcard.save() 

    res.send(flashcard) 
  } catch (error) {
    res.status(400).send(error) 
  }
})

router.delete('/flashcards/:id', auth, async (req, res) => {
  const flashcardId = req.params.id 

  try {
    const flashcard = await Flashcard.findOneAndDelete({ _id: flashcardId, createdBy: req.user._id })

    if (!flashcard) {
      res.status(404).send({
        error: 'flashcard not found'
      }) 
    }

    res.send(flashcard) 
  } catch {
    res.status(500).send() 
  }
})

// upload cardPicture
const upload = multer({
  limits: {
      fileSize: 1000000
  },
  fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload an image'))
      }

      cb(undefined, true)
  }
})

router.patch('/flashcards/:id/cardpicture', auth, upload.single('cardpicture'), async(req, res) => {
  const flashcardId = req.params.id

  
  try {
  const buffer = await sharp(req.file.buffer).resize({ width: 400, height: 250 }).png().toBuffer()

  const flashcards = await Flashcard.findOne({ _id: flashcardId, createdBy: req.user._id })

  console.log(flashcards)
    
  const lastFlashcardIndex = flashcards.flashcardset.length - 1
  const currentImageCard = flashcards.flashcardset[lastFlashcardIndex]

  //currentImageCard["cardPicture"] = buffer

  currentImageCard.cardPicture = buffer


  flashcards.flashcardset.push(currentImageCard)
  
  await flashcards.save()

  res.send(flashcards) 
} catch (error) {
  res.status(400).send({ error: error.message })
  }

})

router.get('/flashcards/:id/cardpicture', async (req, res) => {

  const flashcardId = req.params.id

  try {
      const flashcards = await Flashcard.findById({ _id: flashcardId })

      const lastFlashcardIndex = flashcards.flashcardset.length-1
      const currentImageCard = flashcards.flashcardset[lastFlashcardIndex]

      if (!flashcards || !flashcards.flashcardset) {
           throw new Error()
      }

      console.log(flashcards.flashcardset)

      res.set('Content-Type', 'image/png')
      res.send(flashcards.flashcardset[lastFlashcardIndex].cardPicture)
  } catch (e) {
      res.status(404).send()
  }
})

module.exports = router 
