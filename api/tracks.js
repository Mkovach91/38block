const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tracks = await prisma.track.findMany();
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const track = await prisma.track.findUniqueOrThrow({ where: { id: +id } });

    if (req.user) {
      const playlists = await prisma.playlist.findMany({
        where: {
          ownerId: req.user.id,
          tracks: { some: { trackId: +id } },
        },
      });
      return res.json({ track, playlists });
    }

    res.json({ track });
  } catch (error) {
    next(error);
  }
});

module.exports = router;