const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = await User.findById(request.user.id)

  const blog = new Blog({ ...request.body, user: user.id })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const populatedBlog = await savedBlog.populate('user', {
    username: 1,
    name: 1,
  })

  response.status(201).json(populatedBlog)
})

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user
    const deletedBlog = await Blog.findOneAndDelete({
      _id: request.params.id,
      user: user.id,
    })

    if (!deletedBlog) {
      return response
        .status(404)
        .json({ error: 'blog not found or unauthorized' })
    }

    response.status(204).end()
  }
)

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user

  const updateObject = request.body

  const updatedBlog = await Blog.findOneAndUpdate(
    { _id: request.params.id, user: user.id },
    updateObject,
    { new: true }
  )

  const populatedBlog = await updatedBlog.populate('user', {
    username: 1,
    name: 1,
  })

  if (!populatedBlog) {
    return response
      .status(404)
      .json({ error: 'blog not found or unauthorized' })
  }

  response.json(populatedBlog)
})

blogsRouter.put(
  '/:id/like',
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user

    const updateObject = request.body

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: request.params.id },
      updateObject,
      { new: true }
    )

    const populatedBlog = await updatedBlog.populate('user', {
      username: 1,
      name: 1,
    })

    if (!populatedBlog) {
      return response
        .status(404)
        .json({ error: 'blog not found or unauthorized' })
    }

    response.json(populatedBlog)
  }
)


// comments functionality

blogsRouter.get('/:id/comments', async (request, response) => {
  const {id} = request.params // blog.id from the request parameters
  const blog = await Blog.findById(id)  
  if(!blog) {
    return response.status(404).json({error: 'Blog not found'})
  }

  const comments = blog.comments
  response.json(comments)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const { id } = request.params
  const { comment } = request.body
  const blog = await Blog.findById(id)
  if(!blog) {
    return response.status(404).json({error: 'Blog not found'})
  }

  blog.comments = blog.comments.concat(comment)
  const savedBlog = await blog.save()

  response.json(savedBlog)
})



module.exports = blogsRouter
