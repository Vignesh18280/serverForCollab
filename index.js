const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Connection} = require('./db/makeDb');
const freelance = require('./db/addfree');
const mongoose = require('mongoose');
const user = require('./db/addperson');
const check = require('./helpers/check');
const id_checker = require('./helpers/id_checker');
const org = require('./db/addorg');
const getorg = require('./helpers/getorg');
const addproj = require('./db/addproj');
const getrollno = require('./helpers/getrollno');
const fs = require('fs');
const path = require('path');
const query = require('./db/postquery')
const comment = require('./db/addcomment');
const removedSpecified = require('./db/removeSpecified');
const check_plag = require('./db/check_plag');

Connection.open();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {

})

app.post('/login', async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(password === null || email === null) {
        res.status(400).send('Bad request');
    }
    else {
        try{
            const user = await Connection.db.db('collab').collection('login-credentials').findOne({email: email});
            if(user === null) {
                res.status(401).send('Unauthorized');
            }
            else {
                if(user.pass === password) {
                    const user = await Connection.db.db('collab').collection('users-coll').findOne({email: email});
                    res.status(200).send(user);
                    //res.status(200).send('OK');
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            }
        }catch(err) {
            res.status(500).send('Internal server error');
        }
    }
})

app.post('/register', async(req, res) => {
    try{
        const id_string = req.body.org.toUpperCase() + '@' + req.body.rollno.toLowerCase();
        if(await Connection.db.db('collab').collection('orgs').findOne({id_o: req.body.org.toUpperCase()}) === null) {
            res.status(404).send('Not found');
        }
        else 
        if(await Connection.db.db('collab').collection('login-credentials').findOne({email: req.body.email}) !== null) {
            res.status(409).send('Conflict');
        }
        else if(await Connection.db.db('collab').collection('users-coll').findOne({id_p: id_string}) !== null) {
            res.status(409).send('Conflict');
        }else {
            // const NEW_USER = new user({
            //     _id: new mongoose.Types.ObjectId(),
            //     id_p: id_string,
            //     email: req.body.email,
            //     name: req.body.first_name,
            //     pass: req.body.password,
            //     org: req.body.org.toUpperCase(),
            //     rollno: req.body.rollno.toLowerCase(),
            // })
            // await Connection.db.db('collab').collection('users-coll').insertOne(NEW_USER);
            // await Connection.db.db('collab').collection('followers').insertOne({
            //     id_f: id_string,
            //     followers: [],
            //     following: []
            // })
            // await Connection.db.db('collab').collection('login-credentials').insertOne({email: req.body.email, pass: req.body.password});
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.body.org.toUpperCase()}, {$push: {wlist_u: {id :id_string, name: req.body.first_name, org: req.body.org , email: req.body.email, rollno: req.body.rollno, pass: req.body.password,approved:false}}});
            //await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.body.org.toUpperCase()}, {$push: {students: id_string}});
            //await Connection.db.db('collab').collection('users-coll').updateOne({email: req.body.email}, {$set: {id_p: id_string}});
            res.status(200).send('OK');
        }
    }catch(err){
        res.status(500).send('Internal server error');
    }
})

app.post('/orgregister', async(req, res) => {
    try{
        const id_array = await Connection.db.db('collab').collection('orgs').find({}).toArray();
        const teller = id_checker(id_array, req.body.id_o);
        if(teller === false) {
            res.status(409).send('Conflict');
        }
        else {
            const NEW_ORG = new org({
                _id: new mongoose.Types.ObjectId(),
                id_o: req.body.id_o.toUpperCase(),
                name: req.body.name,
                email: req.body.email,
                pass: req.body.password,
                students: [],
                projects: [],
                hackathons_p: [],
                hackathons_w: [],
                ranking: 0,
                wlist_p: [],
                wlist_u: []
            })
            await Connection.db.db('collab').collection('orgs').insertOne(NEW_ORG);
            await Connection.db.db('collab').collection('login-credentials').insertOne({email: req.body.email, pass: req.body.password});
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/org/:orgId/userapproval/:userId', async(req, res) => {
    try{
        const approve = true;
        const get_org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
        if(approve === true) {
            let get;
            for(let i = 0; i < get_org.wlist_u.length; i++) {
                if(get_org.wlist_u[i].id === req.params.userId) {
                    get = i;
                    break;
                }
            }
            const NEW_USER = new user({
                _id: new mongoose.Types.ObjectId(),
                id_p: get_org.wlist_u[get].id,
                email: get_org.wlist_u[get].email,
                name: get_org.wlist_u[get].name,
                pass: get_org.wlist_u[get].pass,
                org:  get_org.wlist_u[get].org,
                rollno: get_org.wlist_u[get].rollno,
            })
            await Connection.db.db('collab').collection('users-coll').insertOne(NEW_USER);
            await Connection.db.db('collab').collection('followers').insertOne({
                id_f: get_org.wlist_u[get].id,
                followers: [],
                following: []
            })
            await Connection.db.db('collab').collection('login-credentials').insertOne({email: get_org.wlist_u[get].email, pass: get_org.wlist_u[get].pass});
            const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
            const new_Wlist_u = removedSpecified(req.params.userId, org.wlist_u);
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$set: {wlist_u: new_Wlist_u}});
            //await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.body.org.toUpperCase()}, {$push: {wlist_u: {id :id_string, name: req.body.first_name, org: req.body.org , email: req.body.email, rollno: req.body.rollno, pass: req.body.password,approved:false}}});
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$push: {students: {id: get_org.wlist_u[get].id, name: get_org.wlist_u[get].name}}});
            await Connection.db.db('collab').collection('users-coll').updateOne({email: get_org.wlist_u[get].email}, {$set: {id_p: get_org.wlist_u[get].id}});
            res.status(200).send('OK');
        }
        else {
            const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
            const new_Wlist_u = removedSpecified(req.params.userId, org.wlist_u);
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$set: {wlist_u: new_Wlist_u}});
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/org/:orgId/:projId/approve', async(req, res) => {
    try{
        const approve = req.body.approve;
        const get_org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
        if(approve === true) {
            let get;
            for(let i = 0; i < get_org.wlist_p.length; i++) {
                if(get_org.wlist_p[i].id === req.params.projId) {
                    get = i;
                    break;
                }
            }
            const NEW_PROJ = new addproj({
                _id: new mongoose.Types.ObjectId(),
                id_p: get_org.wlist_p[get].id,
                title: get_org.wlist_p[get].title,
                statement:  get_org.wlist_p[get].statement,
                description: get_org.wlist_p[get].description,
                org: get_org.wlist_p[get].org,
                contributors:  get_org.wlist_p[get].contributors,
                tech: get_org.wlist_p[get].tech,
                picture: get_org.wlist_p[get].picture,
                category: get_org.wlist_p[get].category,
                architecture_diagram: get_org.wlist_p[get].architecture_diagram,
                architecture_description: get_org.wlist_p[get].architecture_description,
                sponsors: [],
                video_url: get_org.wlist_p[get].video_url,
                insta: get_org.wlist_p[get].insta,
                twitter: get_org.wlist_p[get].twitter,
                github: get_org.wlist_p[get].github,
                slack: get_org.wlist_p[get].slack
            });
            await Connection.db.db('collab').collection('projects').insertOne(NEW_PROJ);
            const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
            const new_Wlist_p = removedSpecified(req.params.projId, org.wlist_p);
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$set: {wlist_p: new_Wlist_p}});
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$push: {projects: {id: req.body.projId, title: req.body.title}}});
            res.status(200).send('OK');
        }
        else {
            const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
            const new_Wlist_p = removedSpecified(req.params.projId, org.wlist_p);
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.params.orgId}, {$set: {wlist_p: new_Wlist_p}});
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})



app.get('/projects', async(req, res) => {
    try{
        const projects = await Connection.db.db('collab').collection('projects').find({}).toArray();
        if(projects === null) {
            res.status(404).send('Not found');
        }
        else {
            res.status(200).send(projects);
        }
    }catch(err) {
        res.status(500).send('Internal server error');
    }
})

app.get('/user/:userId/followers', async(req, res) => {
    try{
        const get_followers = await Connection.db.db('collab').collection('followers').find({id_f: req.params.userId}).toArray();
        res.status(200).send(get_followers[0].followers);
    }catch(err) {
        res.status(500).send('Internal server error');
    }
})

app.get('/user/:userId/following', async(req, res) => {
    try{
        const get_followers = await Connection.db.db('collab').collection('followers').find({id_f: req.params.userId}).toArray();
        res.status(200).send(get_followers[0].following);
    }catch(err) {
        res.status(500).send('Internal server error');
    }
})

app.get('/project/:projectId', async(req, res) => {
    const projectId = req.params.projectId;
    try{
        const project = await Connection.db.db('collab').collection('projects').findOne({id_p: projectId});
        if(project === null) {
            res.status(404).send('Not found');
        }
        else {
            res.status(200).send(project);
        }
    }catch(err) {
        res.status(500).send('Internal server error');
    }
});

app.get('/user/:userId/addproj', async(req, res) => {
    try{
        const i = req.params.userId;
        const org = getorg(i);
        const s = getrollno(i);
        const id = org + '@' + s;
        const user = await Connection.db.db('collab').collection('followers').findOne({id_f: id});
        if(user === null) {
            console.log('Not found');
            res.status(404).send('Not found');
        }
        else {
            const collaborators  = user.following;
            res.status(200).send(collaborators);
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/user/:userId/postquery', async(req, res) => {
    try{
        const id = req.params.userId;
        const org = getorg(id);
        const rollno = getrollno(id);
        const REAL_ID = org + '@' + rollno;
        const user = await Connection.db.db('collab').collection('users-coll').findOne({id_p: REAL_ID});
        //const date = new Date();
        const user_see_queries = await Connection.db.db('collab').collection('ind_queries').findOne({id: REAL_ID});
        const query_count = user_see_queries.queries + 1;
        const blog_id = org+ '@' + rollno + '@' + query_count;
        //we have to use multer for storing the image 
        const NEW_QUERY = new query({
            _id: new mongoose.Types.ObjectId(),
            query_id: blog_id,
            title: req.body.title,
            description: req.body.description,
            // picture: {
            //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.picture)),
            //     contentType: 'image/png'
            // }
            commetns: []
        });
        await Connection.db.db('collab').collection('queries').insertOne(NEW_QUERY);
        await Connection.db.db('collab').collection('ind_queries').updateOne({id: REAL_ID}, {$set: {queries: query_count}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/forum', async(req, res) => {
    try{
        const queries = await Connection.db.db('collab').collection('queries').find({}).toArray();
        res.status(200).send(queries);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.get('/forum/:blogId', async(req, res) => {
    try{
        const posts = await Connection.db.db('collab').collection('queries').findOne({id: req.params.blogId}).toArray();
        res.status(200).send(posts);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/forum/:blogId/see/:userId', async(req, res) => {
    try{
        const user = await Connection.db.db('collab').collection('users-coll').findOne({id_p: req.params.userId});
        console.log(user.name);
        const NEW_COMMENT = new comment({
            _id: new mongoose.Types.ObjectId(),
            name: user.name,
            org: user.org,
            comment: req.body.comment,
            likes: 0
        });
        await Connection.db.db('collab').collection('queries').updateOne({id: req.params.blogId}, {$push: {comments: NEW_COMMENT}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/forum/:blogId/see/:userId/like', async(req, res) => {
    try{
        const blog = await Connection.db.db('collab').collection('queries').findOne({id: req.params.blogId});
        await Connection.db.db('collab').collection('queries').updateOne({id: req.params.blogId}, {$inc: {'comments.$[elem].likes': 1}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/user/:userId/addproj', async(req, res) => {
    try{
        const id = req.params.userId;
        const org = getorg(id);
        const rollno = getrollno(id);
        const user = await Connection.db.db('collab').collection('projects').find({}).toArray();
        const proj_count = user.length + 1;
        const id_c = org + '@' + rollno;
        const id_p = org + '@' + rollno + '@' + proj_count;
        // const NEW_PROJ = new addproj({
        //     _id: new mongoose.Types.ObjectId(),
        //     id_p: id_p,
        //     title: req.body.title,
        //     statement: req.body.statement,
        //     description: req.body.description,
        //     org: org,
        //     contributors: req.body.contributors,
        //     tech: req.body.tech,
        //     picture: req.body.picture,
        //     architecture_diagram: req.body.architecture_diagram,
        //     architecture_description: req.body.architecture_description,
        //     sponsors: [],
        //     video_url: req.body.video_url,
        //     insta: req.body.insta,
        //     twitter: req.body.twitter,
        //     github: req.body.github,
        //     slack: req.body.slack
        // });
        const projects = await Connection.db.db('collab').collection('projects').find({}).toArray();
        const result = check_plag({title: req.body.title, desc: req.body.description}, projects);
        if(!result) {
            await Connection.db.db('collab').collection('orgs').updateOne({id_o: org}, {$push: {wlist_p: {id: id_p, title: req.body.title, statement: req.body.statement, description: req.body.description, org: org, category: req.body.category , contributors: [...req.body.contributors, {id: id_c, name:user.name}], tech: req.body.tech, picture: req.body.picture, architecture_diagram: req.body.architecture_diagram, architecture_description: req.body.architecture_description, sponsors: [], video_url: req.body.video_url, insta: req.body.insta, twitter: req.body.twitter, github: req.body.github, slack: req.body.slack}}});
            //await Connection.db.db('collab').collection('projects').insertOne(NEW_PROJ);
            //await Connection.db.db('collab').collection('users-coll').updateOne({id_p: id_c}, {$push: {projects: proj_count}});
            res.status(200).send('OK');
        }
        else {
            res.send('pl');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.get('/org/:orgId/wlistp', async(req, res) => {
    try{
        const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
        res.status(200).send(org.wlist_p);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/org/:orgId/wlistu', async(req, res) => {
    try{
        const org = await Connection.db.db('collab').collection('orgs').findOne({id_o: req.params.orgId});
        res.status(200).send(org.wlist_u);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/GetFreelance', async(req, res) => {
    try{
        const work_posts = await Connection.db.db('collab').collection('freelance').find({}).toArray();
        if(work_posts === null) {
            res.status(404).send('Not found');
        }
        else {
            res.status(200).send(work_posts);
        }
    }catch(err) {
        res.status(500).send('Internal server error');
    }
});

app.get('/GetFreelance/DetaulFree/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const details = await Connection.db.db('collab').collection('freelance').findOne({id: id});
        res.status(200).send(details);
    }
    catch{
        res.status(500).send('Internal server error');
    }
})

app.get('/user/:userId', async(req, res) => {
    const userId = req.params.userId;
    try{
        const user = await Connection.db.db('collab').collection('users-coll').findOne({id_p: userId});
        if(user === null) {
            res.status(404).send('Not found');
        }
        else {
            res.status(200).send(user);
        }
    }catch(err) {
        res.status(500).send('Internal server error');
    }
});

app.post('/user/:userId/:otherpersonId/follow', async(req, res) => {
    try{
        if(await Connection.db.db('collab').collection('followers').findOne({id_f: req.params.otherpersonId}) === null) {
            res.status(404).send('Not found');
        }
        else{
            const followers = await Connection.db.db('collab').collection('followers').find({id_f: req.params.userId}).toArray();
            const user = await Connection.db.db('collab').collection('users-coll').findOne({id_p: req.params.otherpersonId});
            const user2 = await Connection.db.db('collab').collection('users-coll').findOne({id_p: req.params.userId});
            const teller = check(followers[0].following, req.params.otherpersonId);
            if(teller === false) {
                res.status(409).send('Conflict');
            }
            else {
                await Connection.db.db('collab').collection('followers').updateOne({id_f: req.params.otherpersonId}, {$push: {followers: {id: req.params.userId, name: user2.name}}});
                await Connection.db.db('collab').collection('followers').updateOne({id_f: req.params.userId}, {$push: {following: {id:req.params.otherpersonId,name: user.name}}});
                res.status(200).send('OK'); 
            }
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/GetFreelance/AddCards', async(req, res) => {
    console.log(req.body.email);
    try{
        const user = await Connection.db.db('collab').collection('users-coll').findOne({email: req.body.email});
        console.log(req.body.email);
        if(user === null) {
            res.status(401).send('Unauthorized');
        }
        else {
            const new_freelance_detail = new freelance({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                budget: req.body.budget,
                email: req.body.email,
            });
            Connection.db.db('collab').collection('freelance').insertOne(new_freelance_detail);
            res.status(200).send('OK');
            
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.listen(5050, () =>{ 
    console.log('Example app is listening on port 5050.')
});
