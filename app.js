
const fastify=require('fastify')({logger:true});
const path=require('path');
const ejs=require('ejs');
const fastifyView=require('@fastify/view');
const fastifyStatic=require('@fastify/static');
const pool=require('./db/pool');
const bcrypt=require('bcryptjs');

//Register JWT
fastify.register(require('@fastify/cookie'))
fastify.register(require('@fastify/jwt'), {
    secret:process.env.SECRET || 'supersecret',
    sign: {expiresIn: '1h'},
    cookie:{
        cookieName:'token',
        signed:false
    }
});

// Add authentication hook for protected routes
// Add authentication hook for protected routes using preHandler
fastify.addHook('preHandler', async (request, reply) => {
    // Allow public routes without authentication
    const publicRoutes = ['/', '/login'];
    const url = request.raw.url.split('?')[0];
    if (publicRoutes.includes(url)) return;

    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.redirect('/');
    }
});




// Register view engine
fastify.register(fastifyView, {
    engine: { ejs: require('ejs') },
    root: path.join(__dirname, 'views')
})

// Register static files
fastify.register(fastifyStatic,{
    root:path.join(__dirname,'public'),
    prefix:'/public/'
})

// Register form body and multipart for file uploads
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), {
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

//Login Page
fastify.get('/',async(req,reply)=>{
    const roles=await pool.query('select roleid, rolename from roles');
    try{
         const error=req.query.error || null;
    return reply.view('login.ejs',{roles : roles.rows,error,user:req.user});
    }catch(err){
        req.log.error(err);
    }
   
});


//login authentication
fastify.post('/login', async (req, reply) => {
    const { email, password, role_id } = req.body;
    try {
        // Get roles for dropdown (for error rendering)
        const rolesResult = await pool.query('select roleid, rolename from roles');
        const roles = rolesResult.rows;

        // Find user by email
        const result = await pool.query('select id, email, password, role_id from users where email=$1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            // Check password and role
            if (isMatch && String(user.role_id) === String(role_id)) {
                const token = fastify.jwt.sign({ id: user.id, email: user.email, roleid: user.role_id });
                reply.setCookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                });
                return reply.redirect('/program');
            } else {
                return reply.view('login.ejs', { error: 'Invalid email, password, or role', roles });
            }
        } else {
            return reply.view('login.ejs', { error: 'Invalid email, password, or role', roles });
        }
    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
})

// Show add program form and list of programs
fastify.get('/program', async (req, reply) => {
    const success = req.query.success === '1';
    let error = req.query.error || null;
    try {
        const result = await pool.query('SELECT id, title, description, encode(icon, \'base64\') as icon FROM programs ORDER BY created_at DESC');
        return reply.view('addprogram.ejs', { success, error, programs: result.rows,user:req.user });
    } catch (err) {
        req.log.error(err);
        return reply.view('addprogram.ejs', { success: false, error: 'Error fetching programs.', programs: [] });
    }
});

// Get single program details (for popup)
fastify.get('/programs/:id', async (req, reply) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, title, description, encode(icon, \'base64\') as icon FROM programs WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return reply.status(404).send({ error: 'Program not found' });
        }
        return reply.send(result.rows[0]);
    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: 'Error fetching program details' });
    }
});

// Update program details
fastify.post('/programs/:id/edit', async (req, reply) => {
    try {
        let title = '';
        let description = '';
        let iconBuffer = null;
        const { id } = req.params;

        if (req.isMultipart && req.isMultipart()) {
            const parts = req.parts();
            for await (const part of parts) {
                if (part.file && part.fieldname === 'icon') {
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    iconBuffer = Buffer.concat(chunks);
                } else if (part.fieldname === 'title') {
                    title = part.value;
                } else if (part.fieldname === 'description') {
                    description = part.value;
                }
            }
        } else {
            title = req.body.title;
            description = req.body.description;
            iconBuffer = req.body.icon;
        }

        if (!title || !description) {
            return reply.redirect('/?error=Missing required fields');
        }

        if (iconBuffer) {
            await pool.query(
                'UPDATE programs SET title = $1, icon = $2, description = $3 WHERE id = $4',
                [title, iconBuffer, description, id]
            );
        } else {
            await pool.query(
                'UPDATE programs SET title = $1, description = $2 WHERE id = $3',
                [title, description, id]
            );
        }
        reply.redirect('/?success=1');
    } catch (err) {
        req.log.error(err);
        reply.redirect('/?error=Error updating program');
    }
});


// Handle form submission for adding a program
const fs = require('fs');


// Handle form submission for adding a program (icon as binary)

fastify.post('/programs/add', async (req, reply) => {
    try {
        let title = '';
        let description = '';
        let iconBuffer = null;

        if (req.isMultipart && req.isMultipart()) {
            const parts = req.parts();
            for await (const part of parts) {
                if (part.file && part.fieldname === 'icon') {
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    iconBuffer = Buffer.concat(chunks);
                } else if (part.fieldname === 'title') {
                    title = part.value;
                } else if (part.fieldname === 'description') {
                    description = part.value;
                }
            }
        } else {
            title = req.body.title;
            description = req.body.description;
            iconBuffer = req.body.icon;
        }

        if (!title || !description || !iconBuffer) {
            return reply.view('addprogram.ejs', { success: false, error: 'Missing required fields or image.', user: req.user });
        }

        await pool.query(
            'INSERT INTO programs (title, icon, description) VALUES ($1, $2, $3) RETURNING id',
            [title, iconBuffer, description]
        );

        return reply.redirect('/?success=1');
    } catch (err) {
        req.log.error(err);
        if (err.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
            return reply.view('addprogram.ejs', { success: false, error: 'Unsupported file type. Please upload a valid image.' });
        }
        if (err.statusCode === 413 || err.message.includes('request file too large')) {
            return reply.view('addprogram.ejs', { success: false, error: 'File too large. Maximum allowed size is 2MB.' });
        }
        return reply.view('addprogram.ejs', { success: false, error: 'Error saving program.' });
    }
});

// Load Users Page
fastify.get('/users',async(req,reply)=>{
    const roles=await pool.query('select roleid, rolename from roles');
    const users = await pool.query(`
        SELECT users.id, users.email, roles.rolename
        FROM users
        JOIN roles ON users.role_id = roles.roleid
        ORDER BY users.id
    `);
    try{
            
          return reply.view('users.ejs',{roles:roles.rows,user:req.user,users: users.rows});
    }catch(err){
        req.log.error(err);
        return reply.view('users.ejs',{roles:[],user:req.user,users: []});
    }
  
})


//post user data
fastify.post('/user/add', {
    schema:{
        body:{
            type:'object',
            required:['email','password','roleid'],
            properties:{                
                email:{type:'string',format:'email'},
                password:{type:'string'},
                roleid:{type:'integer'}
            }
        }
    }
},async(req,reply)=>{
    const {email,password,roleid}=req.body;
    try{
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.query('insert into users (email,password,role_id) values ($1,$2,$3)',[email,hashedPassword,Number(roleid)]);
        return reply.status(200).send({message:'User added successfully'});
    } catch(error){
        req.log.error(error);
        if (error.code === '23505') { // Unique violation in PostgreSQL
        return reply.status(409).send({message: 'User already exists'});
         }
         return reply.status(200).send({message:'Invalid data'});
    }
})


// Logout route
fastify.get('/logout', async (req, reply) => {
    reply.clearCookie('token');
    return reply.redirect('/');
});

fastify.listen({port:3000},(err,address)=>{
    if(err){
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
})