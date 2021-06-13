const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../model/Profile');
const User = require('../../model/User');

//@route  GET api/profile/me
//@desc   get user profile
//@access public
router.get('/me',auth,async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({msg : 'There is no profile for this user'});
        }

        res.json(profile)

    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
});



//@route  POST api/profile
//@desc   create or update user profile
//@access public
router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    const {company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin} = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }


    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;


    try{
        let profile = await Profile.findOne({user:req.user.id});

        //update profile
        if (profile){
            profile = await Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{});
            return res.json(profile);
        }

        //create profile
        profile = new Profile(profileFields);
        await profile.save();

        return res.json(profile);

    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

});




//@route  GET api/profile
//@desc   get all profile
//@access public
router.get('/',async (req,res)=>{
    try{
        const profile = await Profile.find().populate('user',['name','avatar']);
        res.json(profile);
    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});



//@route  GET api/profile/user/:user_id
//@desc   get profile by user id
//@access public
router.get('/user/:user_id',async (req,res)=>{
    try{
        const profile = await Profile.findOne({user : req.params.user_id}).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({msg:"There is no profile for this user"});
        }
        res.json(profile);
    }catch (e) {
        console.error(e.message);
        if (e.kind == "ObjectId"){
            return res.status(400).json({msg:"There is no profile for this user"});
        }
        res.status(500).send('Server error');
    }
});





//@route  DELETE api/profile
//@desc   delete profile, user and post
//@access private
router.delete('/',auth,async (req,res)=>{
    try{

        //remove user posts

        //remove user profile
        await Profile.findOneAndRemove({user : req.user.id});

        //remove user
        await User.findOneAndRemove({_id : req.user.id});
        res.json({msg : 'user deleted'});
    }catch (e) {
        console.error(e.message);
        if (e.kind == "ObjectId"){
            return res.status(400).json({msg:"There is no profile for this user"});
        }
        res.status(500).send('Server error');
    }
});



//@route  PUT api/profile/experience
//@desc   add profile experience
//@access private
router.put('/experience',[auth,[
    check("title","Title is required").not().isEmpty(),
    check("company","Company is required").not().isEmpty(),
    check("from","From Date is required").not().isEmpty(),
]],async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {title,company,location,from,to,current,description} = req.body;

    const newExp = {
        title,company,location,from,to,current,description
    }

    try{
        const profile = await Profile.findOne({user : req.user.id});

        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

});



//@route  DELETE api/profile/experience/:exp_id
//@desc   delete profile experience
//@access private
router.delete('/experience/:exp_id',auth,async (req, res) => {

    try{
        const profile = await Profile.findOne({user : req.user.id});

        //get remove index
        const removeIndex= profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1);
        await profile.save();

        res.json(profile);



    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

});









//@route  PUT api/profile/education
//@desc   add profile education
//@access private
router.put('/education',[auth,[
    check("school","School is required").not().isEmpty(),
    check("degree","Degree is required").not().isEmpty(),
    check("fieldofstudy","Field of study is required").not().isEmpty(),
    check("from","From Date is required").not().isEmpty(),
]],async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {school,degree,fieldofstudy,from,to,current,description} = req.body;

    const newExp = {
        school,degree,fieldofstudy,from,to,current,description
    }

    try{
        const profile = await Profile.findOne({user : req.user.id});

        profile.education.unshift(newExp);
        await profile.save();
        res.json(profile);
    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

});



//@route  DELETE api/profile/education/:exp_id
//@desc   delete profile education
//@access private
router.delete('/education/:exp_id',auth,async (req, res) => {

    try{
        const profile = await Profile.findOne({user : req.user.id});

        //get remove index
        const removeIndex= profile.education.map(item => item.id).indexOf(req.params.exp_id);
        profile.education.splice(removeIndex,1);
        await profile.save();

        res.json(profile);



    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }

});




//@route  DELETE api/profile/github/:username
//@desc   get user repos from github
//@access public
router.get('/github/:username',(req, res) => {
    try{
        const options={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node-js'}
        };

        request(options,(error,response,body)=>{
            if (error){
                console.error(error);
            }

            if (response.statusCode !== 200){
                return res.status(400).json({msg:"No github profile found"});
            }
            res.json(JSON.parse(body));
        })

    }catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
})







module.exports = router;
