import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        lowercase:true,
        required:true,
        trim:true,
        unique:[true,'project name must be unique'],
    },
    users:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    
})

function findbyuserid(UserId) {
    return projectSchema.find({users: UserId}).then((result) => {
        return result;
    })

    
}

const Project = mongoose.model('project',projectSchema)

export default Project; 