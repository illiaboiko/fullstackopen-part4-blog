const { test, describe } = require("node:test");
const assert = require("node:assert");

const totalLikes = require("../utils/list_helper").totalLikes;

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
  ];

  const listWithManyBlogs = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go Tlksjdlfkjl",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
  ];

  const listWithoutBlogs = [];

  test("when list has one blog, equals the likes of that", () => {
    const result = totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  test("when list has many blogs, equals the sum of all likes", () => {
    const result = totalLikes(listWithManyBlogs);
    assert.strictEqual(result, 10);
  });

  test("when it's empty list, equals 0", () => {
    const result = totalLikes(listWithoutBlogs);
    assert.strictEqual(result, 0);
  });
});
