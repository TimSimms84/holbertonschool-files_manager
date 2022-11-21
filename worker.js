const Bull = require('bull');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const Mongo = require('./utils/db');

const fileQueue = new Bull('fileQueue');

class thumbnailMaker {
  static async getThumbs() {
    fileQueue.process(async (job) => {
      console.log('file queue worker.js');
      const { fileId, userId } = job.data;
      if (!fileId) throw Error('Missing fileId');
      if (!userId) throw Error('Missing userId');
      const file = Mongo.files.findOne({ _id: fileId, userId });
      if (!file) throw Error('File not found');
      // await fs.writeFileSync(`${file.localPath}/${file.name}`);
      const sizes = [100, 250, 500];
      sizes.forEach(async (size) => {
        const thumbnail = await imageThumbnail(`${file.localPath}/${file.name}`, size);
        await fs.writeFileSync(`${file.localPath}/${file.name}_${size}`, thumbnail);
      });
    });
  }
}

module.exports = thumbnailMaker;
