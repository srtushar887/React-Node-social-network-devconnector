const express = require('express');
const router = express.Router();


//@route  POST api/user
//@desc   user register
//@access public
router.get('/',(req, res) => {
    res.send('posts route');
});

module.exports = router;
