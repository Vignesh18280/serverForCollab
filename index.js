const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const {Connection} = require('./db/makeDb');
const {freelance} = require('./db/addfree');
const mongoose = require('mongoose');
const {user} = require('./db/addperson');
const check = require('./helpers/check');
const id_checker = require('./helpers/id_checker');
const {org} = require('./db/addorg');
const getorg = require('./helpers/getorg');
const {addproj} = require('./db/addproj');
const getrollno = require('./helpers/getrollno');
const fs = require('fs');
const path = require('path');
const {query} = require('./db/postquery')
const {comment} = require('./db/addcomment');
const {removedSpecified} = require('./db/removeSpecified');
const check_plag = require('./db/check_plag');
const ENV = require('dotenv').config();
const cloudinary = require("./MiddleWares/cloudinary");
const upload = require("./MiddleWares/Multerrr")
const {loginCred} = require('./db/loginCreds');
const {foll} = require("./db/Followers.js");
const { promiseHooks } = require('v8');
const {waitinguser} = require('./db/WaitingList');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
            const user1 = await loginCred.findOne({email: email});
            console.log(user1)
            if (user1 === null) {
                return res.status(404).json("Not Found");
            } else {
                if (user1.password === password) {
                    const user2 = await user.findOne({ email: email });
                    const sendd = { ...user2, tt: user1.tt };
                    return res.status(200).json(sendd);
                } else {
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
        if(await org.findOne({id_o: req.body.org.toUpperCase()}) === null) {
            res.status(404).send('Not found');
        }
        else 
        if(await loginCred.findOne({email: req.body.email}) !== null) {
            res.status(409).send('Conflict');
        }
        else if(await user.findOne({id_p: id_string}) !== null) {
            res.status(409).send('Conflict');
        }else {
            if(await waitinguser.findOne({id_w: id_string}) !== null) {
                return res.status(409).send('Conflict');
            }
            const wait = new waitinguser({
                id_w: id_string,
                email: req.body.email,
                name: req.body.name,
                org: req.body.org,
                rollno: req.body.rollno,
                pass: req.body.password,
                approve: false
            });
            await wait.save();
            // await Connection.db.db('collab').collection('login-credentials').insertOne({email: req.body.email, pass: req.body.password});
            await org.updateOne({id_o: req.body.org.toUpperCase()}, {$push: {wlist_u: {id :id_string, name: req.body.name, org: req.body.org , email: req.body.email, rollno: req.body.rollno, pass: req.body.password,approved:false}}});
            //await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.body.org.toUpperCase()}, {$push: {students: id_string}});
            //await Connection.db.db('collab').collection('users-coll').updateOne({email: req.body.email}, {$set: {id_p: id_string}});
            res.status(200).send('OK');
        }
    }catch(err){
        console.log(err)
        res.status(500).send('Internal server error');
    }
})

app.post('/orgregister', upload.any() , async(req, res) => {
    try{
        const id_array = await org.find({});
        const teller = id_checker(id_array, req.body.id_o);
        const files = req.files
        console.log(files);
        if(teller === false) {
            res.status(409).send('Conflict');
        }
        else {
            const images = [];
            const uploadImages = async () => {
              for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path);
                images.push(result.secure_url);
              }
            };
      
            await uploadImages();
            console.log(images);
            const NEW_ORG = new org({
                id_o: req.body.id_o.toUpperCase(),
                name: req.body.name,
                email: req.body.email,
                pass: req.body.password,
                students: [],
                projects: [],
                hackathons_p: [],
                hackathons_w: [],
                ranking: 0,
                picture: images[0],
                wlist_p: [],
                wlist_u: []
            })
            console.log(NEW_ORG)
            await NEW_ORG.save();
            const CRED = new loginCred({email: req.body.email, password: req.body.password, tt: "org"});
            await CRED.save();
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})


app.get('/organization/:orgId', async(req, res) => {
    try{
        const {orgId} = req.params;
        const org = await org.findOne({id_o: orgId});
        return res.status(200).json(org);

    }
    catch(err){
        console.log(err);
        return res.status(400).json("Not Found");
    }
})

app.patch('/organization/:orgId' , async(req, res)=> {
    try{
        const {orgId} = req.params;
        const orgs = await org.findOne({id_o: orgId});
        const desc = req.body.description.length != 0 ? req.body.description : orgs.description; 
        const new_org = await org.updateOne({id_o: orgId}, {$set: {description : desc}});
        if(req.body.projects.length != 0){
            await org.findOneAndUpdate(
                {id_o: orgId},
                {
                    $push : {
                        projects : req.body.projects
                    }
                },
                {
                    new : true
                })
        }
        if(req.body.hackathons_p.length != 0){
            await org.findOneAndUpdate(
                {id_o: orgId},
                {
                    $push : {
                        hackathons_p : req.body.hackathons_p
                    }
                },
                {
                    new : true
                })
        }
        if(req.body.hackathons_w.length != 0){
            await org.updateOne(
                {id_o: orgId},
                {
                    $push : {
                        hackathons_w : req.body.hackathons_w
                    }
                },
                {
                    new : true
                })
        }
        return res.status(200).json(new_org);
    }
    catch(err){
        console.log(err);
        return res.status(400).json("cant Upload")
    }
})

app.post('/org/:orgId/userapproval/:userId', async(req, res) => {
    try{
        const approve = true;
        const get_org = await org.findOne({id_o: req.params.orgId});
        console.log(get_org.wlist_u);
        console.log(req.params.userId);
        if(approve === true) {
            let get;
            for(let i = 0; i < get_org.wlist_u.length; i++) {
                if(get_org.wlist_u[i].id_w === req.params.userId) {
                    get = i;
                    break;
                }
            }
            const NEW_USER = new user({
                id_p: get_org.wlist_u[get].id_w,
                email: get_org.wlist_u[get].email,
                name: get_org.wlist_u[get].name,
                pass: get_org.wlist_u[get].pass,
                org:  get_org.wlist_u[get].org,
                rollno: get_org.wlist_u[get].rollno,
            })
            await NEW_USER.save();
            const newfoll = new foll({
                id_f: get_org.wlist_u[get].id_w,
                followers: [],
                following: []
            });
            await newfoll.save();
            const CRED = new loginCred({email: get_org.wlist_u[get].email, password: get_org.wlist_u[get].pass, tt: "user"});
            await CRED.save();
            const org1 = await org.findOne({id_o: req.params.orgId});
            await waitinguser.deleteOne({id_w: req.params.userId});
            const new_Wlist_u = removedSpecified(req.params.userId, org1.wlist_u);
            await org.updateOne({id_o: req.params.orgId}, {$set: {wlist_u: new_Wlist_u}});
            //await Connection.db.db('collab').collection('orgs').updateOne({id_o: req.body.org.toUpperCase()}, {$push: {wlist_u: {id :id_string, name: req.body.first_name, org: req.body.org , email: req.body.email, rollno: req.body.rollno, pass: req.body.password,approved:false}}});
            await org.updateOne({id_o: req.params.orgId}, {$push: {students: {id: get_org.wlist_u[get].id, name: get_org.wlist_u[get].name}}});
            await user.updateOne({email: get_org.wlist_u[get].email}, {$set: {id_p: get_org.wlist_u[get].id}});
            res.status(200).send('OK');
        }
        else {
            const org = await org.findOne({id_o: req.params.orgId});
            const new_Wlist_u = removedSpecified(req.params.userId, org.wlist_u);
            await org.updateOne({id_o: req.params.orgId}, {$set: {wlist_u: new_Wlist_u}});
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});


app.post('/org/:orgId/:projId/approve', async(req, res) => {
    try{
        const approve = req.body;
        console.log(approve.approve)
        const get_org = await org.findOne({id_o: req.params.orgId});
        const whatever = [];
            for(let i = 0; i < get_org.wlist_p.length; i++) {
                if(get_org.wlist_p[i].id !== req.params.projId) {
                    whatever.push(get_org.wlist_p[i]);
                }
            }
        if(approve.approve === true) {
            let get;
            for(let i = 0; i < get_org.wlist_p.length; i++) {
                if(get_org.wlist_p[i].id === req.params.projId) {
                    get = i;
                    break;
                }
            }
            const NEW_PROJ = new addproj({
                id_p: get_org.wlist_p[get].id,
                title: get_org.wlist_p[get].title,
                statement:  get_org.wlist_p[get].statement,
                description: get_org.wlist_p[get].description,
                org: get_org.wlist_p[get].org,
                contributors:  get_org.wlist_p[get].contributors,
                tech: get_org.wlist_p[get].tech,
                picture: get_org.wlist_p[get].picture,
                category: get_org.wlist_p[get].category,
                decumentation: get_org.wlist_p[get].decumentation,
                architecture_description: get_org.wlist_p[get].architecture_description,
                sponsors: [],
                video_url: get_org.wlist_p[get].video_url,
                insta: get_org.wlist_p[get].insta,
                twitter: get_org.wlist_p[get].twitter,
                github: get_org.wlist_p[get].github,
                slack: get_org.wlist_p[get].slack
            });
            await NEW_PROJ.save();
            const org1 = await org.findOne({id_o: req.params.orgId});
            const new_Wlist_p = removedSpecified(req.params.projId, org1.wlist_p);
            await org.updateOne({id_o: req.params.orgId}, {$set: {wlist_p: whatever}});
            await org.updateOne({id_o: req.params.orgId}, {$push: {projects: {id: req.body.projId, title: req.body.title}}});
            res.status(200).send('OK');
        }
        else {
            const org1 = await org.findOne({id_o: req.params.orgId});
            // const new_Wlist_p = removedSpecified(req.params.projId, org1.wlist_p);
            await org.updateOne({id_o: req.params.orgId}, {$set: {wlist_p: whatever}});
            res.status(200).send('OK');
        }
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})



app.get('/projects', async(req, res) => {
    try{
        const projects = await addproj.find();
        console.log(projects)
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
        const get_followers = await foll.find({id_f: req.params.userId}).toArray();
        res.status(200).send(get_followers[0].followers);
    }catch(err) {
        res.status(500).send('Internal server error');
    }
})

app.get('/user/:userId/following', async(req, res) => {
    try{
        const get_followers = await foll.find({id_f: req.params.userId}).toArray();
        res.status(200).send(get_followers[0].following);
    }catch(err) {
        res.status(500).send('Internal server error');
    }
})

app.get('/project/:projectId', async(req, res) => {
    const projectId = req.params.projectId;
    try{
        const project = await addproj.findOne({id_p: projectId});
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
        const user = await foll.findOne({id_f: id});
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
        const user1 = await user.findOne({id_p: REAL_ID});
        //const date = new Date();
        // const user_see_queries = await Connection.db.db('collab').collection('ind_queries').findOne({id: REAL_ID});
        // const query_count = user_see_queries.queries + 1;
        const blog_id = org+ '@' + rollno + '@' + Math.random() * 1000000;
        //we have to use multer for storing the image 
        const NEW_QUERY = new query({
            _id: new mongoose.Types.ObjectId(),
            query_id: blog_id,
            title: req.body.title,
            description: req.body.description,
            comments: []
        });
        //await Connection.db.db('collab').collection('queries').insertOne(NEW_QUERY);
        await NEW_QUERY.save();
        //await Connection.db.db('collab').collection('ind_queries').updateOne({id: REAL_ID}, {$set: {queries: query_count}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/forum', async(req, res) => {
    try{
        const queries = await query.find({});
        res.status(200).json(queries);
    }catch(err) {
        console.log(err);
        res.status(500).json('Internal server error');
    }
});

app.get('/forum/:blogId', async(req, res) => {
    try{
        const posts = await query.findOne({query_id: req.params.blogId});
        res.status(200).send(posts);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/forum/:blogId/see/:userId', async(req, res) => {
    try{
        const user = await user.findOne({id_p: req.params.userId});
        console.log(user.name);
        const NEW_COMMENT = new comment({
            _id: new mongoose.Types.ObjectId(),
            name: user.name,
            org: user.org,
            comment: req.body.comment,
            likes: 0
        });
        await query.updateOne({id: req.params.blogId}, {$push: {comments: NEW_COMMENT}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/forum/:blogId/see/:userId/like', async(req, res) => {
    try{
        const blog = await query.findOne({id: req.params.blogId});
        await query.updateOne({id: req.params.blogId}, {$inc: {'comments.$[elem].likes': 1}});
        res.status(200).send('OK');
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/user/:userId/addproj',upload.any() , async(req, res) => {
    try{
        //console.log(req)
        const id = req.params.userId;
        // console.log(req)
        // console.log(req.body)
        // console.log(id)
        const org1 = getorg(id);
        const rollno = getrollno(id);
        const user = await addproj.find();
        const proj_count = user.length + 1;
        const id_c = org1 + '@' + rollno;
        const id_p = org1 + '@' + rollno + '@' + proj_count;
        const projects = await addproj.find();
        const images = [];
        const videos = [];
        const pdf = [];
        const files = req.files; 
        // console.log(req.files)       
        // console.log(files);
        const uploadPromises = files.map((file) => {
            return new Promise(async (resolve, reject) => {
                const mediatype = file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'application';

                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        resource_type: mediatype
                    });

                    if (mediatype === 'image') {
                        images.push({
                            mediaType: mediatype,
                            url: result.secure_url,
                            public_id : result.public_id
                        });
                    } else if(mediatype === 'video') {
                        videos.push({
                            mediaType: mediatype,
                            url: result.secure_url,
                            public_id : result.public_id
                        });
                    }
                    else if(mediatype === 'application') {
                        pdf.push({
                            mediaType: mediatype,
                            url: result.secure_url,
                            public_id : result.public_id
                        });
                    }

                    resolve();
                } catch (error) {
                    console.error(error);
                    reject(new Error("Error while uploading to Cloudinary"));
                }
            });
        });

        await Promise.all(uploadPromises);

        const one = images[0] ? images[0].url : "";
        const two = videos[0] ? videos[0].url : "";
        const three = pdf[0] ? pdf[0].url : "";

        const result = check_plag({title: req.body.title, desc: req.body.description}, projects);
        if(!result) {
            await org.updateOne({id_o: org1},
                 {$push: {wlist_p: {id: id_p, 
                title: req.body.title, 
                statement: req.body.statement, 
                description: req.body.description, 
                org: org1, category: req.body.category , 
                contributors: [...req.body.contributors, {id: id_c, name:user.name}]
                , tech: req.body.tech,
                 picture: one,
                 documentation : three,
                   architecture_description: req.body.architecture_description, 
                   sponsors: [], 
                   video_url: two, 
                   insta: req.body.insta, 
                   twitter: req.body.twitter,
                    github: req.body.github, 
                    slack: req.body.slack
                }}
            });
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
        const org1 = await org.findOne({id_o: req.params.orgId});
        res.status(200).send(org1.wlist_p);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/org/:orgId/wlistu', async(req, res) => {
    try{
       //console.log(req.params.orgId)
        const org1 = await org.findOne({id_o: req.params.orgId});
        res.status(200).json(org1.wlist_u);
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
})

app.get('/GetFreelance', async(req, res) => {
    try{
        const work_posts = await freelance.find({});
        if(work_posts === null) {
            res.status(404).send('Not found');
        }
        else {
            res.status(200).json(work_posts);
        }
    }catch(err) {
        res.status(500).send('Internal server error');
    }
});

app.get('/GetFreelance/DetaulFree/:id', async(req, res) => {
    try {
        const id = req.params.id;
        //console.log(id)
        const details = await freelance.findOne({_id: id});
        //console.log(details)
        res.status(200).json(details);
    }
    catch{
        res.status(500).send('Internal server error');
    }
})

app.get('/user/:userId', async(req, res) => {
    const userId = req.params.userId;
    try{
        const user1 = await user.findOne({id_p: userId});
        if(user1 === null) {
            return res.status(404).send('Not found');
        }
        else {
            return res.status(200).json(user1);
        }
    }catch(err) {
        console.log(err)
        res.status(500).send('Internal server error');
    }
});

app.post('/user/:userId/:otherpersonId/follow', async(req, res) => {
    try{
        if(await foll.findOne({id_f: req.params.otherpersonId}) === null) {
            res.status(404).send('Not found');
        }
        else{
            const followers = await foll.find({id_f: req.params.userId}).toArray();
            const user = await user.findOne({id_p: req.params.otherpersonId});
            const user2 = await user.findOne({id_p: req.params.userId});
            const teller = check(followers[0].following, req.params.otherpersonId);
            if(teller === false) {
                res.status(409).send('Conflict');
            }
            else {
                await foll.updateOne({id_f: req.params.otherpersonId}, {$push: {followers: {id: req.params.userId, name: user2.name}}});
                await foll.updateOne({id_f: req.params.userId}, {$push: {following: {id:req.params.otherpersonId,name: user.name}}});
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
        // const user1 = await user.findOne({email: req.body.email});
        // console.log(req.body.email);
        // if(user1 === null) {
        //     res.status(401).send('Unauthorized');
        // }
        // else {
            // const findd = await freelance.findOne({email: req.body.email})
            // if(findd === null) {
            const new_freelance_detail = new freelance({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                budget: req.body.budget,
                email: req.body.email,
            });
            await new_freelance_detail.save();
            //Connection.db.db('collab').collection('freelance').insertOne(new_freelance_detail);
            res.status(200).send('OK');
            // }
            // else {
            //     return res.status(409).json("Conflict");
            // }
            
    }catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

const URL = process.env.PORT || 5050;

app.listen(URL, () =>{ 
    console.log('Example app is listening on port 5050.')
});

const value = process.env.CONNECTION_URL

mongoose.connect(value)
    .then(() => {
        console.log("The database has been connected")
    })
    .catch((err) => {
        console.log(err)
    });