const jwt = require("jsonwebtoken");
const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  response.json(blog);
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const user = await User.findById(request.user.id);
  const blog = new Blog({ ...request.body, user: user.id });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
  const user = request.user;
  const deletedBlog = await Blog.findOneAndDelete({
    _id: request.params.id,
    user: user.id,
  });

  if (!deletedBlog) {
    return response
      .status(404)
      .json({ error: "blog not found or unauthorized" });
  }

  response.status(204).end();
});

blogsRouter.put("/:id", middleware.userExtractor, async (request, response) => {
  const user = request.user;

  const updateObject = request.body;

  const updatedBlog = await Blog.findOneAndUpdate(
    { _id: request.params.id, user: user.id },
    updateObject,
    { new: true }
  );

  if (!updatedBlog) {
    return response
      .status(404)
      .json({ error: "blog not found or unauthorized" });
  }

  response.json(updatedBlog);
});

module.exports = blogsRouter;
