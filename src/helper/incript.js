const bcryptjs  = require('bcryptjs')

const hashedPassword= async(password)=>{
    return await bcryptjs.hash(password,8)
}
module.exports ={hashedPassword}