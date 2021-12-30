describe('post model', () => {

    const Post = require('../../src/post/post.model');

    it('should return error if no author', () => {

        const newPost = new Post({
            author: '',
            content: ''
        })

        newPost.validate(err => {
            expect(err.errors.author).toBeTruthy();
        })

    })

    it('should return error if no content', () => {

        const newPost = new Post({
            author: '',
            content: ''
        })

        newPost.validate(err => {
            expect(err.errors.content).toBeTruthy();
        })

    })

})

describe('post controllers', () => {

    const Post = require('../../src/post/post.model');
    const User = require('../../src/user/user.model');
    const controller = require('../../src/post/post.controller');

    const mockResponse = () => {
        return {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            end: jest.fn().mockReturnThis()
        }
    }

    const database = require('../../util/memoryDatabase');

    let user;
    let existingPost;

    beforeAll(async () => { 
        await database.connect();
        await database.seed();
        user = await User.findOne({ email: 'bwayne@wayne.com' });
        existingPost = await Post.findOne({ author: user._id, content: 'this is a post' });
    });

    afterAll(async() => await database.disconnect());

    it('create should add post to database and return status 201 and post id', async () => {
        
        const body = {
            user: user._id,
            content: "I'm Batman"
        }

        const req = { body: body };

        const res = mockResponse();

        await controller.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ post: expect.anything() });

    })

    it('create should return 400 if error when saving post', async () => {

        const body = { user: '', content: '' }
        const req = { body: body }
        const res = mockResponse();

        await controller.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'post could not be created' })

    })

    it('get should return the post from the database and return status 200', async () => {
    
        const req = { params: { id: existingPost._id } }
        const res = mockResponse();

        await controller.get(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(existingPost);

    })

    it('get should return 404 if post not found in database', async () => {

        const req = { params: { id: '1234' } }
        const res = mockResponse();

        await controller.get(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'post not found' })

    })

    it('getAll should return all posts from database and status 200', async () => {

        const req = {};
        const res = mockResponse();

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ posts: expect.anything() });

    });

    it('update should update the post in datebase and return status 204', async () => {

        const req = {
            params: { id: existingPost._id },
            body: { content: "I'm Batman" }
        };

        const res = mockResponse();

        await controller.update(req, res);

        expect(res.status).toHaveBeenCalledWith(204);

        const updatedPost = Post.findById(existingPost._id);

        expect(updatedPost).toBeTruthy();

    })

    it('update should return 404 if post does not exist', async () => {

        const req = {
            params: { id: 'abcd' },
            body: { content: 'abcd' }
        };

        const res = mockResponse();

        await controller.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'post does not exist' })

    })

    it('update should return 400 if error updating the post', async () => {

        const req = {
            params: { id: existingPost._id },
            body: { content: '' }
        };

        const res = mockResponse();

        await controller.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'post could not be updated' })

    })

    it('delete should remove the post from the database and return status 202', async () => {

        const req = { params: { id: existingPost._id } }
        const res = mockResponse();

        await controller.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(202);

    })

    it('delete should return 400 if error deleting the post', async () => {

        const req = { params: { id: 'abcd' } }
        const res = mockResponse();

        await controller.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ error: 'post does not exist' })

    })

})

describe('post routes', () => {

    let app;
    let request;
    let route;
    let mockController;
    let mockAuth;

    beforeAll(() => {
        mockController = require('../../src/post/post.controller');
        mockAuth = require('../../src/middleware/authenticator');

        jest.spyOn(mockController, 'create').mockImplementation((req, res) => res.end());
        jest.spyOn(mockController, 'getAll').mockImplementation((req, res) => res.end());
        jest.spyOn(mockController, 'get').mockImplementation((req, res) => res.end());
        jest.spyOn(mockController, 'update').mockImplementation((req, res) => res.end());
        jest.spyOn(mockController, 'delete').mockImplementation((req, res) => res.end()); 
        jest.spyOn(mockAuth, 'authenticateToken').mockImplementation((req, res, next) => next());

        route = '/api/posts'
        app = require('../../app');
        request = require('supertest')(app);
    })

    it('POST request to create post authenticates token and calls create method of post controller', async () => {

        await request.post(`${route}/`);

        expect(mockAuth.authenticateToken).toHaveBeenCalled();
        expect(mockController.create).toHaveBeenCalled();

    })

    it('GET request for all posts calls getAll method of post controller', async () => {

        await request.get(`${route}/`);

        expect(mockController.getAll).toHaveBeenCalled();

    })

    it('GET request for a post calls get method of post controller', async () => {

        await request.get(`${route}/post123`);

        expect(mockController.get).toHaveBeenCalled();

    })

    it('PUT request for a post calls update method of post controller', async () => {

        await request.put(`${route}/post123`);

        expect(mockAuth.authenticateToken).toHaveBeenCalled();
        expect(mockController.update).toHaveBeenCalled();

    })

    it('DELETE request for a post calls delete method of post controller', async () => {

        await request.delete(`${route}/post123`);

        expect(mockAuth.authenticateToken).toHaveBeenCalled();
        expect(mockController.delete).toHaveBeenCalled();

    })

})  