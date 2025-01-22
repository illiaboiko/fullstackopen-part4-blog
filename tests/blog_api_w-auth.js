const { test, after, beforeEach, describe } = require("node:test");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const initialBlogs = helper.initialBlogs;

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  const savedBlogPromises = blogObjects.map((blog) => blog.save());

  await Promise.all(savedBlogPromises);
});

after(async () => {
  await mongoose.connection.close();
});

describe("POST:creating a blog", () => {
  test("should create a blog with valid token and payload", async () => {
    const newBlogObj = {
      title: "sending another blog post",
      author: "Illia Boiko",
      url: "google.com",
      likes: 10,
    };

    const token = helper.getToken();

    const savedBlogResponse = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogObj)
      .expect(201)
      .expect("Content-type", /application\/json/);

    assert.strictEqual(savedBlogResponse.body.title, newBlogObj.title);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1);

    const savedBlogAtEnd = await Blog.findById(savedBlogResponse.body.id);

    assert.strictEqual(savedBlogAtEnd.author, newBlogObj.author);
  });

  test("should return 401 if no token is provided", async () => {
    const newBlogObj = {
      title: "sending another blog post",
      author: "Illia Boiko",
      url: "google.com",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .send(newBlogObj)
      .expect(401)
      .expect("Content-type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length);
  });


    test("should return 401 if invalid token is provided", async () => {
    const newBlogObj = {
      title: "sending another blog post",
      author: "Illia Boiko",
      url: "google.com",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", 'invalid_token')
      .send(newBlogObj)
      .expect(401)
      .expect("Content-type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length);
  });
});
