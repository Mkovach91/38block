const prisma = require("../prisma");

const seed = async (numTracks = 20) => {
  const tracks = Array.from({ length: numTracks }, (_, i) => ({
    name: `Track ${i + 1}`,
  }));
  await prisma.track.createMany({ data: tracks });
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });