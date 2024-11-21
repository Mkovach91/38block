const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("./auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({ where: { ownerId: req.user.id } });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  const { name, description, trackIds } = req.body;

  try {
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        tracks: { create: trackIds.map((trackId) => ({ track: { connect: { id: +trackId } } })) },
      },
    });
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;

  try {
    const playlist = await prisma.playlist.findUniqueOrThrow({
      where: { id: +id },
      include: { tracks: { include: { track: true } } },
    });

    if (playlist.ownerId !== req.user.id) {
      throw { status: 403, message: "Forbidden: You do not own this playlist." };
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
});

module.exports = router;