const mongoose = require('mongoose')

const adminfeeSchema = new mongoose.Schema(
    {
        fee :{
            type:'string',
            required:'false',
            
        }
    }
)

const adminfee = mongoose.model('adminfee', adminfeeSchema)
module.exports= adminfee