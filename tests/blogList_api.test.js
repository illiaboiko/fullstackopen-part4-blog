const { test, after, beforeEach, describe } = require("node:test");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");
const { title } = require("node:process");

const api = supertest(app);

const initialBlogs = helper.initialBlogs;

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  const savedBlogPromises = blogObjects.map((blog) => blog.save());

  await Promise.all(savedBlogPromises);
});

test("all blogs (6) are returned from the server", async () => {
  const blogs = await helper.blogsInDb();
  assert.strictEqual(blogs.length, initialBlogs.length);
});

test("response from GET request is in JSON format", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test('unique identifier property for blog post is named "id" ', async () => {
  //   const blogs = await helper.blogsInDb()
  //   const blog = blogs[0]
  //   const keys = Object.keys(blog)
  //   assert.strictEqual(keys.find(str => str === 'id'), 'id')

  // this is another code using toJSON and querying only one entry from the db
  const response = await Blog.findOne({});
  const blog = response.toJSON(response);
  const keys = Object.keys(blog);
  assert.strictEqual(
    keys.find((str) => str === "id"),
    "id"
  );
});

test("a valid blog post is successfully added in db", async () => {
  const newBlogObj = {
    title: "New Test post",
    author: "Illia Boiko test",
    url: "some_url.com",
    likes: 10,
  };

  const savedBlogResponse = await api
    .post("/api/blogs")
    .send(newBlogObj)
    .expect(201)
    .expect("Content-type", /application\/json/);

  assert.strictEqual(savedBlogResponse.body.title, newBlogObj.title);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1);

  const savedBlogAtEnd = await Blog.findById(savedBlogResponse.body.id);

  assert.strictEqual(savedBlogAtEnd.author, newBlogObj.author);
});

test("if added blog doesnt have likes value, it defaults to zero", async () => {
  const newBlogObj = {
    title: "note without likes",
    author: "test",
    url: "some url.com",
  };

  const savedBlogResponse = await api
    .post("/api/blogs")
    .send(newBlogObj)
    .expect(201)
    .expect("Content-type", /application\/json/);

  const id = savedBlogResponse.body.id;
  const savedBlogAtEnd = await Blog.findById(id);

  assert.strictEqual(savedBlogAtEnd.likes, 0);
});

test("if title or url are missing, response is 400-Bad-Request", async () => {
  const newBlogObj = {
    title: "note without likes",
    author: "test",
    // url: "some url.com",
    likes: 10,
  };

  await api.post("/api/blogs").send(newBlogObj).expect(400);
});

describe("deleting posts", () => {
  test("deleting with valid ID is successful", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const idToDelete = blogsAtStart[0].id;
    await api.delete(`/api/blogs/${idToDelete}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1);
  });

  test("deleting with invalid id returns 400 bad request", async () => {
    const invalidID = 1;
    await api.delete(`/api/blogs/${invalidID}`).expect(400);
  });
});

describe("updating posts", () => {
  test("updating ulr of the existing post", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdateId = blogsAtStart[0].id;

    fieldToUpdate = {
        likes: 1000
    }

    await api
      .put(`/api/blogs/${blogToUpdateId}`)
      .send(fieldToUpdate)
      .expect(200);

    const blogToUpdateAtEnd = await Blog.findById(blogToUpdateId);
    assert.strictEqual(blogToUpdateAtEnd.likes, fieldToUpdate.likes);
  });

  test("updating url of the post using invalid id", async () => {
    const invalidID = 1;

    fieldToUpdate = {
        likes: 1000
    }

    await api
      .put(`/api/blogs/${invalidID}`)
      .send({ url: "new url" })
      .expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
