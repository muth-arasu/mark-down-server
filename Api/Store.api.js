const express = require("express");
const Router = express.Router();
const authorization = require('../middlewares/authorization.js');
const DraftsModel = require("../models/draftsModel.js");
const { default: mongoose } = require("mongoose");

// Get drafts list with pagination and filters
Router.get('/draft/list', authorization, async (req, res) => {
  try {
    const { page = 1, limit = 10, email, startDate, endDate, searchValue } = req.query;

    let filter = {};

    if (email) {
      filter.email = email;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (searchValue) {
      filter.notes = { $regex: searchValue, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const allDraftData = await DraftsModel.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await DraftsModel.countDocuments(filter).exec();

    if (allDraftData.length > 0) {
      res.status(200).json({
        message: "Successfully fetched all draft data",
        notes: allDraftData,
        total,
        currentPage: parseInt(page),
      });
    } else {
      res.status(404).json({ error: "No draft data found in collections" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get draft by ID
Router.get('/draft/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const draft = await DraftsModel.findById({_id:id});
    if (draft) {
      res.status(200).json(draft);
    } else {
      res.status(404).json({ message: "Draft not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update draft by ID
Router.put('/draft/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDraft = await DraftsModel.findByIdAndUpdate(id, req.body, { new: true });
    if (updatedDraft) {
      res.status(200).json({ message: "Draft updated successfully", draft: updatedDraft });
    } else {
      res.status(404).json({ message: "Draft not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save new draft
Router.post('/draft/save', authorization, async (req, res) => {
  try {
    const newDraft = await DraftsModel.create(req.body);
    res.status(201).json({ message: "Draft saved successfully", draft: newDraft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = Router;
