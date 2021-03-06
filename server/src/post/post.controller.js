const Post = require('./post.model');

exports.create = async (req, res) => {

    const { user, content, title } = req.body;
    let post;

    try { 
        post = await Post.create({
            author: user,
            content: content,
            title: title
        })
    } catch (err) {
        return res.status(400).json({ error: 'post could not be created' });
    }
    
    res.status(201).json({ post: post._id });
    
}

exports.get = async (req, res) => {

    const { id } = req.params;
    let post;

    try {
        post = await Post.findById(id)
            .populate('author', 'firstName lastName')
            .populate('votes')
            .populate('comments');
    } catch (err) {
        return res.status(404).json({ error: 'post not found' });
    }
    
    res.status(200).json(post);

}

exports.getAll = async (req, res) => {

    let posts;

    try {
        posts = await Post.find({})
            .populate('author', 'firstName lastName')
            .populate('votes')
            .populate('comments')
            .sort({ date: 'desc' });
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: 'error retrieving posts' })
    }

    res.status(200).json(posts)

}

exports.update = async (req, res) => {

    const { id } = req.params
    const { user, content, title } = req.body;
    let post;
    
    try {
        post = await Post.findById(id);
    } catch (err) {
        return res.status(404).json({ error: 'post does not exist' });
    }
    
    if (user !== post.author.toString()) {
        return res.status(403).json({ error: 'forbidden' });
    }

    try {
        post.content = content;
        post.title = title;
        await post.save();
    } catch (err) {
        return res.status(400).json({ error: 'post could not be updated' });
    }

    res.status(204).end();

}

exports.delete = async (req, res) => {

    const { id } = req.params

    try {
        await Post.deleteOne({ _id: id });
    } catch (err) {
        return res.status(400).json({ error: 'post does not exist' });
    }

    res.status(202).end();

} 