const fs = require('fs').promises;
const path = require('path');

const killBotsInFolder = async (folderName: string) => {
  console.log('Starting to remove bots...');
  const directoryPath = path.join(
    __dirname,
    `../core/data/worlds/${folderName}/entities`,
  );
  try {
    let totalRemoved = 0;
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (data.etype === 'bot') {
        console.log(`Removing bot: ${file}`);
        await fs.unlink(filePath);
        totalRemoved++;
      }
    }
    console.log(`Finished removing ${totalRemoved} bots.`);
  } catch (error) {
    console.error('Error removing bots:', error);
  }
};

const start = async () => {
  await killBotsInFolder('main');
  await killBotsInFolder('flat');
  await killBotsInFolder('flat2');
};

start();
