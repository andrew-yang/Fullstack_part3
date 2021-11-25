const mongoose = require('mongoose')

if (process.argv.length < 1) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const newName = process.argv[3]

const newNumber = process.argv[4]

const url =
  `mongodb+srv://Fullstack:${password}@cluster0.wnxu7.mongodb.net/test?retryWrites=true`

mongoose.connect(url)

const phoneBookEntrySchema = new mongoose.Schema({
    name: String,
    number: String,
})

const PhoneBookEntry = mongoose.model('PhoneBookEntry', phoneBookEntrySchema)



if(process.argv.length === 3){
    //Get Phonebook
    console.log('phonebook:')
    PhoneBookEntry.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })

} else if(process.argv.length === 5){

    const phoneBookEntry = new PhoneBookEntry({
        name: newName,
        number: newNumber,
    })

    phoneBookEntry.save().then(
        () => {
            console.log('note Saved!')
            mongoose.connection.close()
        }
    )
}
