const 
    config = require('./config.json'),
    Mongoose = require('mongoose'),
    { generateHash, validatePassword } = require('./validate')

// Mongoose.connect(config.uri)
// Mongoose.connection.on('error',err =>{
//     console.log('MongoDB connection Error:'+ err)
// })


    Mongoose.connect('mongodb://localhost/todoapp');
  
    Mongoose.connection.on('error',err =>{
        console.log('MongoDB connection Error:'+ err)
    })

const UserSchema = new Mongoose.Schema({
    username: String,
    socketId: String,
    password: String
}, { strict: false })

const ProjectSchema = new Mongoose.Schema({
    name:String,
    user:String
},{strict:false})

const TodoSchema = new Mongoose.Schema({
    desc:String,
    user:String,
    project:String,
    done:Boolean,
    edit:Boolean,
    date:Date,
},{strict:false})

//create models
const 
    Project = Mongoose.model('projects',ProjectSchema)
    Todo =Mongoose.model('todos',TodoSchema)
    User = Mongoose.model('users', UserSchema)

const findUserByName = userName => User.findOne({ username: { $regex: `^${userName}$`, $options: 'i' } })

const createUser = (username, password, socketId) => {
    //find if user is already exists or not
        return findUserByName(username)
            .then(found => {
                if (found)
                    throw new Error('User already exists')
    
                //return user object with Hashed password
                return {
                    socketId,
                    username: username,
                    password: generateHash(password)
                }
            })
            //save users in database
            .then(user => User.create(user))
            //return  user object
            .then((user) => {
                return user
            })
    }
    
    
const loginUser = (username, password, socketId) => {
        // find if the username is in the db
        return findUserByName(username)
            .then(found => {
                if (!found)
                    throw new Error('User does not exists')
    
                // validate the password
                const valid = validatePassword(password, found.password)
                if (!valid)
                    throw new Error('Invalid Password')
    
                return found
            })
            // active == have socketId
            .then(({ _id }) => User.findOneAndUpdate({ _id }, { $set: { socketId } }))
            // return user object
            .then((user) => {
                return user
            })
    }


const  activeProject = () => Project.find({name:{$ne:null}})

const allTodo = () => Todo.find()

const allUser = () => User.find()

const completedTodo = () => Todo.find({done:true})

const uncompletedTodo = () => Todo.find({done:false})

const findProjectByName = name => Project.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })

const findTodoByProject = pname =>Todo.find({project:pname})

const changeStatus =(description,status,pname) => Todo.findOneAndUpdate({desc:description,project:pname},{done:status})

const removeTodo = (description,pname) => Todo.findOneAndRemove({desc:description,project:pname})

const editProject = (oldname,newname) => Project.findOneAndUpdate({name:oldname},{$set:{name:newname}},{ "new": true})

const editTodoProjectName = (oldname,newname) => Todo.update({project:{$eq:oldname}},{project:newname},{multi:true})

const toggleTodo = (todo,project,edit) => Todo.findOneAndUpdate({desc:todo,project:project},{$set:{edit:edit}},{ "new": true})

const removeProject = (pname) =>Project.findOneAndRemove({name:pname})

const removeTaskByProject = (pname) =>  Todo.remove({project:{$eq:pname}})

const editTodo = (project,todo,newtodo) => Todo.findOneAndUpdate({project:project,desc:todo},{$set:{desc:newtodo,edit:false}},{ "new": true})

const archiveTodo = () => Todo.remove({done:true})

const createProject = (pname,username) => {
    //finding if project is already is db
    return findProjectByName(pname)
            .then(found=>{
                if(found)
                    throw new error('project already exists')

                return{
                    name:pname,
                    user:username
                }
            })//create project
            .then(project =>Project.create(project))
          
}

const createTodo = todo => {
    const newTodo= {
        project:todo.project,
        desc:todo.desc,
        user:todo.user,
        done:false,
        edit:false,
        date:new Date()
    }

    return Todo.create(newTodo)
}



module.exports = {
    loginUser,
    createUser,
    allTodo,
    allUser,
    completedTodo,
    activeProject,
    uncompletedTodo,
    createProject,
    createTodo,
    removeTodo,
    findProjectByName,
    findTodoByProject,
    changeStatus,
    editProject,
    removeProject,
    toggleTodo,
    editTodo,
    removeTaskByProject,
    archiveTodo,
    editTodoProjectName

}
