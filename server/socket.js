module.exports = (server,db) =>{

    const 
        io = require('socket.io')(server),
        moment = require('moment')

    io.on('connection',socket =>{

        db.activeProject()
                .then(projects => io.emit('refresh-project',projects))
            
        db.allUser()
                .then(user => io.emit('refresh-users',user))

        db.allTodo()
                .then(todos => io.emit('refresh-todos',todos))


        socket.on('create-user', (username, password) => {
            db.createUser(username, password, socket.id)
                .then(created => socket.emit('successful-join', created))
                .catch(err => socket.emit('failed-join', { name: username }))
        })

        socket.on('join-user', (username, password) => {
            db.loginUser(username, password, socket.id)
                .then(created =>socket.emit('successful-join', created))
                .catch(err => socket.emit('failed-join', { name: username }))
        })

        //retrun created project for socket
        socket.on('create-project',(name,username)=>{
            db.createProject(name,username)
                .then(created => io.emit('successful-project',created))
                .catch(err => io.emit('failed-project',{name:name}))
        })

        //return created todo for all users
        socket.on('create-todo',data=>{
            db.createTodo(data)
                .then(created => io.emit('successful-todo',created))
        })

        //return todos by project name
        socket.on('display-todos',(pname)=>{
            db.findTodoByProject(pname)
                    .then(todos =>socket.emit('display-todos',todos))
        })

        //change the status of todos
        socket.on('change-status',(description,status,pname)=>{
           
            db.changeStatus(description,status,pname).then(todo=>db.findTodoByProject(pname))
            .then(todos => socket.emit('display-todos',todos))
                
        })

        //remove todos from app
        socket.on('remove-todo',(description,pname)=>{
            db.removeTodo(description,pname).then(todos=>db.findTodoByProject(pname))
            .then(todos =>socket.emit('display-todos',todos))
        })

        socket.on('edit-project',(oldpname,newpname)=>{
            db.editProject(oldpname,newpname)
            .then(project => db.editTodoProjectName(oldpname,newpname))
           // .then(project => db.activeProject())
            .then(projects => socket.emit('updated-project',oldpname,newpname))
        })

        //removes from application
        socket.on('remove-project',(project)=>{
            db.removeProject(project)
            .then(project=>db.removeTaskByProject(project.name))
            .then(todo=>db.activeProject())
            .then(projects => socket.emit('remove-project',projects))
        })

        socket.on('toggle-todo',(todo,project,edit)=>{
            db.toggleTodo(todo,project,edit)
            .then(todos=>db.findTodoByProject(project))
            .then(todos =>socket.emit('display-todos',todos))
        })
        socket.on('edit-todo',(project,todo,newtodo)=>{
            db.editTodo(project,todo,newtodo)
            .then(todos=>db.findTodoByProject(project))
            .then(todos =>socket.emit('display-todos',todos))
        })
        socket.on('archive-todo',()=>{
            db.archiveTodo().then(todo=>db.activeProject())
            .then(projects => socket.emit('remove-project',projects))
        })
       
    })
}