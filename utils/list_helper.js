const blog = require("../models/blog");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum += blog.likes, 0) 
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;
  return blogs.reduce((mostLiked, currentBlog) =>
    currentBlog.likes > mostLiked.likes ? currentBlog : mostLiked
  );
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};
