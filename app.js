const express = require('express')
const path  = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const Attendance = require('./model/attendance')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'secret5798@'

mongoose.connect('mongodb://localhost:27017/login-app-db', {

    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
const app =express()
app.use('/',express.static(path.join(__dirname,'static')))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render('index.html')
  });

app.post('/api/login',async (req,res) => {

    const { username, password } = req.body

    const user = await User.findOne({username}).lean();

    if(!user) {
        return res.json({ status:'error',error: 'Invalid Username and Password'})
    }

    if(await bcrypt.compare(password, user.password)) {
        //username & password combination is successfull

        const token = jwt.sign(
            { 
             id: user._id,
             username: user.username
            },
            JWT_SECRET
        )
        
        jwt.verify(token, JWT_SECRET)
        console.log(token)
        return res.json({status: 'ok', data : token })
        
         

    }

    res.json({status: 'error', error : 'Invalid Username and Password'})
   
})

app.post('/api/register',async (req,res) =>{

    //hashing the password
    const { username, password: plainTextPassword, mobile } = req.body

   if(!username || typeof username !== 'string' ){
        return res.json({status : 'error', error: 'Invalid EmailId'})
    }
    if(!plainTextPassword || typeof plainTextPassword !== 'string' ){
        return res.json({status : 'error', error: 'Invalid password'})
    }
    if(plainTextPassword.length<5){
        return res.json({
            status:'error',
            error: 'Password is too small.Should be atleast 6 characters'
        })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try{

        const response = await User.create({
            username,
            password,
            mobile
        })
        console.log('User Created Successfully:', response)

    }catch(error){
        if(error.code === 11000){

            return res.json({ status :'error', error: 'Email ID Already in Use'})
        }
        
        throw error
    }
    res.json({status: 'ok'})
})



//attendance crud operations

//get all employee data from db
app.get('/api/employees', function(req, res) {
	// use mongoose to get all todos in the database
	Attendance.find(function(err, employees) {
		// if there is an error retrieving, send the error otherwise send data
		if (err)
			res.send(err)
		res.json(employees); // return all employees in JSON format
	});
});


// get a employee with ID of 1
app.get('/api/employees/:ObjectId', function(req, res) {
	let id = req.params.ObjectId;
	Attendance.findById(id, function(err, employee) {
		if (err)
			res.send(err)

		res.json(employee);
	});

});


// create employee and send back all employees after creation
app.post('/api/employees', async(req, res)=> {

	const {name, email,mobile,department,status} = req.body;
	// create mongose method to create a new record into collection
	try{

		const response = await Attendance.create({
		    name,
		    email,
		    mobile,
		    department,
		    status
		})
		console.log('Employee Attendance Created Successfully:', response)
	
	    }catch(error){
		if(error.code === 11000){
	
		    return res.json({ status :'error', error: 'Error in creating data'})
		}
		
		throw error
	    }
	    res.json({status: 'ok'})
 
});

// create employee and send back all employees after creation
app.put('/api/employees/:ObjectId', function(req, res) {
	// create mongose method to update a existing record into collection
	let id = req.params.ObjectId;
	var data = {
		name : req.body.name,
		email : req.body.email,
		mobile : req.body.mobile,
        department : req.body.department,
        status: req.body.status,
	}
 
	// save the user
	Attendance.findByIdAndUpdate(id, data, function(err, employee) {
	if (err) throw err;
 
	res.send('Successfully! Employee updated - '+employee.name);
	});
});

// delete a employee by id
app.delete('/api/employees/:ObjectId', function(req, res) {
	console.log(req.params.ObjectId);
	let id = req.params.ObjectId;
	Attendance.remove({
		_id : id
	}, function(err) {
		if (err)
			res.send(err);
		else
			res.send('Successfully! Employee has been Deleted.');	
	});
});

app.listen(7000,()=> {

    console.log('Server started at port 7000')

}) 
