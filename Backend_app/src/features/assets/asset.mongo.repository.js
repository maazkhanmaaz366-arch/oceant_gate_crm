const MediaAsset = require('./asset.model');

class MongoAssetRepository {
  async create(assetData) {
    const asset = new MediaAsset(assetData);
    return await asset.save();
  }

  async findAll() {
    return await MediaAsset.find();
  }

  async findById(id) {
    return await MediaAsset.findById(id);
  }

  async update(id, assetData) {
    return await MediaAsset.findByIdAndUpdate(id, assetData, { new: true });
  }

  async delete(id) {
    return await MediaAsset.findByIdAndDelete(id);
  }
}

module.exports = MongoAssetRepository;
