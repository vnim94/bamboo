const app = require('../../app');
const request = require('supertest')(app);
const database = require('../../util/memoryDatabase');

const User = require('../../src/user/user.model');
const Post = require('../../src/post/post.model');
const { createToken } = require('../../src/middleware/authenticator');
let user;
let token;
let post;

beforeAll(async () => { 
    await database.connect(); 
    await database.seed(); 
    user = await User.findOne();
    token = createToken(user._id.toString());
    post = await Post.findOne({ content: 'this is a post' });
});

afterAll(async () => await database.disconnect());

describe('create post', () => {

    const route = '/api/posts'

    it('POST request to /api/posts creates new post in database and returns status 201 id of new post', async () => {

        const newPost = { 
            author: user._id,
            content: 'this is a new post',
            title: 'this is the title'
        }

        const response = await request.post(route)
            .set('Authorization', `Bearer ${token}`)
            .send(newPost);

        expect(response.status).toBe(201);
        expect(response.body.post).toBeTruthy();

        const savedPost = await Post.findById(response.body.post);
        expect(savedPost).toBeTruthy();
        expect(savedPost.content).toBe('this is a new post');

    })

    it('POST request to /api/posts returns 400 and error message if post could not be created', async () => {

        const newPost = { content: '' }
        const response = await request.post(route)
            .set('Authorization', `Bearer ${token}`)
            .send(newPost);

        expect(response.status).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toBe('post could not be created');

    })

})

describe('get post', () => {

    it('GET request to /api/posts returns all posts in response body and status 200', async () => {

        const response = await request.get('/api/posts');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('votes');
        expect(response.body[0]).toHaveProperty('comments');

    })

    it('GET request to /api/posts/:id returns post and status 200', async () => {

        const response = await request.get(post.url);

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
        expect(response.body.content).toBe('this is a post');
        expect(response.body.votes).toBeTruthy();

    })

    it('GET request to /api/posts/:id returns 404 and post not found message if post does not exist', async () => {

        const response = await request.get('/api/posts/123');

        expect(response.status).toBe(404);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toBe('post not found');

    })

})

describe('update post', () => {

    const Post = require('../../src/post/post.model');

    it('PUT request to /api/posts/:id updates post in database and returns status 204', async () => {

        const response = await request.put(post.url)
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                content: 'this is an updated post',
                title: 'this is an updated title' 
            });

        expect(response.status).toBe(204);

        const updatedPost = await Post.findOne();
        expect(updatedPost.content).toBe('this is an updated post');

    })

    it('PUT request to /api/posts/:id returns 401 and unauthorized if invalid token provided', async () => {

        const response = await request.put(post.url)
            .set('Authorization', 'Bearer abc')
            .send({ content: 'this is an updated post' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('unauthorized');

    })

    it('PUT request to /api/posts/:id returns 403 and forbidden if user is not post author', async () => {

        const validToken = createToken('abc');
        const response = await request.put(post.url)
            .set('Authorization', `Bearer ${validToken}`)
            .send({ content: 'this is an updated post' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('forbidden');

    })

    it('PUT request to /api/posts/:id returns 404 and error message if post does not exist', async () => {

        const response = await request.put('/api/posts/123')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'this is an updated post' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('post does not exist');

    })

    it('PUT request to /api/posts/:id return 400 and error message if post could not be updated', async () => {

        const response = await request.put(post.url)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('post could not be updated');

    })

})

describe('delete post', () => {

    const Comment = require('../../src/comment/comment.model');
    const Vote = require('../../src/vote/vote.model');

    it('DELETE request to /api/posts/:id deletes post, its comments and votes from database and returns status 202', async () => {

        const response = await request.delete(post.url)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(202);
        expect(await Post.findById(post._id)).toBeFalsy();

        const comments = await Comment.find({ post: post._id});
        expect(comments.length).toBe(0);

        const votes = await Vote.find({ content: post._id });
        expect(votes.length).toBe(0);
        
    })

    it('DELETE request to /api/posts/:id returns 401 and error message if no token', async () => {

        const response = await request.delete(post.url);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('no token in Authorization header');

    })

    it('DELETE request to /api/posts/:id returns 401 and unauthorized message if invalid token', async () => {

        const response = await request.delete(post.url)
            .set('Authorization', 'Bearer abc');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('unauthorized');

    })

    it('DELETE request to/api/posts/:id returns 400 if post does not exist and cannot be deleted', async () => {

        const response = await request.delete('/api/posts/123')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('post does not exist');

    })

})