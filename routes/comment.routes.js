const express = require("express");
const router = express.Router();

const CommentModel = require("../models/Comment.model");
const PostModel = require("../models/Post.model");

const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

// Create new comment
router.post(
  "/post/:id/new-comment",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const loggedInUser = req.currentUser;

      const newComment = await CommentModel.create({
        userId: loggedInUser._id,
        ...req.body,
      });

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: newComment._id } },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ error: "Post não encontrado." });
      }

      return res.status(201).json(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

// Update comment
router.put(
  "/post/:id/update-comment/:commentId",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { commentId } = req.params;

      const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { $set: { ...req.body } },
        { new: true }
      );

      return res.status(200).json(updatedComment);
    } catch (err) {
      next(err);
    }
  }
);

// Delete comment
router.delete(
  "/post/:id/delete-comment/:commentId",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id, commentId } = req.params;

      const deletedComment = await CommentModel.findOneAndDelete({
        _id: commentId,
      });

      if (!deletedComment || deletedComment.n < 1) {
        return res.status(404).json({ error: "Comentário não encontrado." });
      }

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: id },
        { $pull: { comments: commentId } },
        { new: true }
      );

      return res.status(200).json(updatedPost);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
