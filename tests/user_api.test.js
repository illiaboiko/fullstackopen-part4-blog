const { test, after, beforeEach, describe } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const supertest = require("supertest");
const app = require("../app");
const { default: mongoose } = require("mongoose");

const api = supertest(app);

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "illiaboiko",
      name: "Illia Boiko",
      password: "lskdjgh2934",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with 400 status code if username  is not provided", async () => {
    const newUser = {
      username: "",
      name: "test",
      password: "",
    };

    const usersAtStart = await helper.usersInDb();

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(
      result.body.error.includes("username and password must be provided")
    );

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with 400 status code if password is shorter than 3 characters", async () => {
    const newUser = {
      username: "test_user",
      name: "test",
      password: "wk",
    };

    const usersAtStart = await helper.usersInDb();

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert(
      result.body.error.includes("password must be at least 3 characters long")
    );

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
