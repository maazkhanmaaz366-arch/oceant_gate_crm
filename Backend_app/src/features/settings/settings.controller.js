const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../../.env');

// Helper to parse .env string into an object
const parseEnv = (content) => {
  const envObj = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envObj[match[1].trim()] = match[2].trim();
    }
  });
  return envObj;
};

// Helper to stringify an object into .env format
const stringifyEnv = (envObj) => {
  return Object.entries(envObj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
};

exports.getEnv = (req, res) => {
  try {
    if (!fs.existsSync(envPath)) {
      return res.status(404).json({ error: '.env file not found' });
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const envObj = parseEnv(content);
    res.json(envObj);
  } catch (error) {
    console.error('Error reading .env:', error);
    res.status(500).json({ error: 'Failed to read .env file' });
  }
};

exports.updateEnv = (req, res) => {
  try {
    if (!fs.existsSync(envPath)) {
      return res.status(404).json({ error: '.env file not found' });
    }
    const currentContent = fs.readFileSync(envPath, 'utf8');
    const envObj = parseEnv(currentContent);

    const updates = req.body;
    
    // Merge updates
    for (const [key, value] of Object.entries(updates)) {
       envObj[key] = value;
    }

    const newContent = stringifyEnv(envObj);
    fs.writeFileSync(envPath, newContent, 'utf8');

    res.json({ message: 'Environment variables updated successfully', updatedKeys: Object.keys(updates) });
  } catch (error) {
    console.error('Error updating .env:', error);
    res.status(500).json({ error: 'Failed to update .env file' });
  }
};
