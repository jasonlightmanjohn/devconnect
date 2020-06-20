const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @router POST api/posts
// @desc Create a post
// @access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @router GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //fetch posts and return the latest post first.
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @router GET api/posts/:id
// @desc Get post by ID
// @access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //fetch post by post ID.
    //check there is post associated with the ID
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      // if the post ID is not valid execute the following.
      return res.status(404).json({ msg: 'post not found' });
    }
    return res.status(500).send('Server Error');
  }
});

// @router DELETE api/posts/:id
// @desc Delete a post
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //fetch post by post ID.
    if (!post) {
      // if the post is not exist execute the following.
      return res.status(404).json({ msg: 'post not found' });
    }
    //check the user delete the post owns the post
    //check on user
    if (post.user.toString() !== req.user.id) {
      // req.user.id is a String vs post.user is an object
      return res.status(401).json({ msg: 'User not autherized' });
    }
    await post.remove();

    res.json({ msg: 'post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      // if the post ID is not valid execute the following.
      return res.status(404).json({ msg: 'post not found' });
    }
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
