const mongoose = require('mongoose')
const draftSchema = new mongoose.Schema({
    email:{type:String},
    notes:[{type:String}]

},{timestamps:true})

const DraftsModel = mongoose.model('drafts',draftSchema)

module.exports = DraftsModel