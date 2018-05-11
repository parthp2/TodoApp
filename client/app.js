const socket = io()

// project Component
const projectComponent = {
   template:`<div>
                <li v-for="data in projects" v-on:click="displayTodos(data.name)" class="list-group-item d-flex justify-content-between align-items-center">
                {{data.name}}
                <span class="badge primary-color badge-pill">2</span>
                </li>
            </div>`,

    props: ['projects','displayTodos']
}

const displayComponent = {
    template:` <div class="col-md-12">
                 <input v-show="proedit"  type="text"  style="width:50%;" :value="activeProject" @keyup.enter="editProject(activeProject,$event.target.value)">
                  <label v-show="!proedit">{{activeProject}}</label>
                    <span class="icon" style="float: right;"><i v-on:click="toggleProject(activeProject,proedit)"  class="fa fa-edit has-text-info"></i></span>
                    <span class="icon"  style="float: right;"><i v-on:click="removeProject(activeProject)"  class="fa fa-trash has-text-danger"></i></span>
            </div>`,
  props:['proedit','activeProject','editProject','toggleProject','removeProject']
}

const todosComponent ={
    template:`<div class="form-group full-width">
              <div v-for="todo in todos">
                <span v-show="!todo.edit">
                    <input v-bind:checked='todo.done' v-on:change="changeStatus(todo.desc,todo.done)"  type="checkbox" >
                    <label  :class="{strikethrough:todo.done}" >{{todo.desc}}</label>
                    <span class="icon" style="float: right;"><i  v-on:click="toggleTodo(todo.desc,todo.project,todo.edit)"  class="fa fa-edit has-text-info"></i></span>
                    <span class="icon"  style="float: right;"><i v-on:click="removeTodo(todo.desc)"  class="fa fa-trash has-text-danger"></i></span>
                </span>
                <span v-show="todo.edit">
                    <input type="text"  style="width:50%;"  :value="todo.desc"  @keyup.enter="editTodo(todo.project,todo.desc,$event.target.value)" >
                    <span class="icon" style="float: right;"><i  v-on:click="toggleTodo(todo.desc,todo.project,todo.edit)"  class="fa fa-edit has-text-info"></i></span>
                </span>
             </div>
             </div>`,
    props:['todos','toggleTodo','removeTodo','editTodo','changeStatus','temptodo']
}


const app =new Vue({
    el:'#todo-app',
    data:{
        loggedIn:true,
        temptodo:'',
        projects:[],
        todos:[],
        todo:'',
        project:'',
        activeProject:'',
        status:'',
        failedproject:'',
        proedit:false,
        username:'parth',
        password:'',
        failedName:'',
        start:'',
        ownProject:false,
        appContent:true,
        numproject:'',
        numtodos:'',
        numusers:'',
        
    },
    methods:{

        joinUser:function(){
            if(!this.username || !this.password)
                return
            socket.emit('join-user',this.username,this.password)
        },
        signupUser:function(){
            if(!this.username || !this.password)
                return
            socket.emit('create-user',this.username,this.password)
        },

        //create projects
        createProject:function(){
            if(!this.project || !this.username)
                return
            socket.emit('create-project',this.project,this.username)
        },

        //creating Todos for Project
        createTodo: function(){
            if(!this.todo || !this.username)
                return
            socket.emit('create-todo',{desc:this.todo,project:this.activeProject,user:this.username})
        },
        //display todos for selected project
        displayTodos:  function(project){
            if(!project)
                return
            this.activeProject=project
            socket.emit('display-todos',this.activeProject)
        },

        //change status of todo like done and undone
        changeStatus: function(todo,status){
            let done
            if(status===true)
                done=false
            else
                done=true
            if(!todo)
                return
            socket.emit('change-status',todo,done,this.activeProject)
        },

        //removes todos from project
        removeTodo: function(todo){
            if(!todo)
                return
            socket.emit('remove-todo',todo,this.activeProject)
        },
        editProject: function(oldpname,newpname){
           
            this.activeProject=newpname
            socket.emit('edit-project',oldpname,newpname)
        },
        toggleProject: function(project,proedit){
            if(!project)
                return

            if(proedit===false)
                 this.proedit=true;
            else
                this.proedit=false
            //socket.emit('edit-project',project)
        },
        toggleTodo: function(todo,project,edit){

            if(edit==false)
                socket.emit('toggle-todo',todo,project,true)
            else
                socket.emit('toggle-todo',todo,project,false)
        
        },

        //remove project from application
        removeProject :function(project){
            if(!project)
                return
            socket.emit('remove-project',project)
         },
        editTodo: function(project,todo,newtodo){
            if(!newtodo)
                return
            
            socket.emit('edit-todo',project,todo,newtodo)
        },
        archiveTodo: function(){
            socket.emit('archive-todo')
        },
        allTodo:function(){
            socket.emit('all-todo')
        }
       
    },
    components: {
        'project-component': projectComponent,
        'todos-component':todosComponent,
        'display-component':displayComponent
        
    }
})

//clinet side socket events

socket.on('refresh-project',projects =>{


    app.projects=[]
    app.projects=projects

    if(projects.length>0)
    {
        
        // app.numproject=projects.length
        //app.start=true
        // app.activeProject=projects[0].name
        // console.log(app.projects)
        // console.log("---")
        // console.log(projects)
        // app.projects=[]
        // app.projects=projects
        app.displayTodos(app.activeProject)
    }
    else if(projects.length===0)
    {
        // app.numproject=0
        // app.start=true
        // app.activeProject=''
        // app.todos=[]
        // app.projects=[]
        // app.numtodos=0
    }
})

socket.on('refresh-todos',todos =>{
    app.numtodos=todos.length
})


socket.on('refresh-users',users =>{
    app.numusers=users.length
})

socket.on('successful-project',content=>{
    // app.start=false
    app.project=''
    app.projects.push(content)
    // app.numproject=app.projects.length
   // app.activeProject=content.name
    // app.todos=[]
    //app.displayTodos(app.activeProject)
})

socket.on('successful-join', user => {
    console.log(app.username)
    console.log(user)
    if (user.username===app.username) {
        app.loggedIn = true
        app.failedName = ''
        app.password = ''
        app.username=user.username
    }
})

socket.on('failed-join', username => {
    console.log(username)
    if (username === app.username)
        app.failedName = username
})


socket.on('successful-todo',content=>{
    app.todo=''
    app.displayTodos(app.activeProject)
   // app.todos.push(content)
   // app.allTodo()
})

socket.on('failed-project',pname =>{
    if(pname===app.project)
        app.faileproject=pname
})

//display todo for project
socket.on('display-todos',todos=>{
    app.todos=[]
    app.todos=todos
})

socket.on('edited-todos',todo=>{
    app.toggleTodo(todo.project,todo.desc,todo.edit)
    app.displayTodos(app.activeProject)
})

socket.on('updated-project',(projects,socketid)=>{
    //  app.proedit=false
    //  if()
    // // app.projects=projects
}),
socket.on('own-project',projects=>{
    app.tempproject=projects
})
socket.on('remove-project',projects=>{
    app.projects=[]
    app.projects=projects

    if(projects.length>0)
    {
        // app.numproject=projects.length
        // app.start=false
        app.activeProject=projects[0].name
        app.displayTodos(app.activeProject)
    }
    else if(projects.length===0)
    {
        app.numproject=0
        app.start=true
        app.activeProject=''
        app.todos=[]
        app.projects=[]
        app.numtodos=0
    }
})
