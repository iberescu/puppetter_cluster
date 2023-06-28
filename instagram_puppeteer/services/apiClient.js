const fs = require('fs');
const client = require('https');
const cron = require("node-cron");
const mysql = require(`mysql-await`);



async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '',
      user: '',
      password: '',
      database: '',
      post: ''
    });
    console.log('Connected to the database');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
}

async function getPosts(connection) {
  try {
    const currentTime = new Date();
    const [rows] = await connection.query('SELECT * FROM posts WHERE timestamp > ?', [currentTime]);
    return rows;
  } catch (error) {
    console.error('Error retrieving posts:', error.message);
    throw error;
  }
}

async function postToInstagram(posts) {
  try {
    for (const post of posts) {
      // Send the post to the server for posting on Instagram
      // await client.post('', post);
      console.log('Posted on Instagram:', post);
    }
  } catch (error) {
    console.error('Error posting on Instagram:', error.message);
    throw error;
  }
}

async function readWall(connection) {
  try {
    const [rows] = await connection.query('SELECT * FROM users');
    for (const user of rows) {
      // Send read wall request every 2 hours for each user
      await client.get(url, {
        params: {
          user: user.username,
          x: user.X,
          y: user.Y,
          z: user.Z
        }
      });
      console.log('Read wall request sent for user:', user.username);
    }
  } catch (error) {
    console.error('Error reading wall:', error.message);
    throw error;
  }
}

async function saveMessages(connection) {
  try {
    const [rows] = await connection.query('SELECT * FROM messages');
    for (const message of rows) {
      // Save the message in the msg table with a user parent column
      await connection.query('INSERT INTO msg (user, message) VALUES (?, ?)', [message.user, message.message]);
      console.log('Message saved:', message);
    }
  } catch (error) {
    console.error('Error saving message:', error.message);
    throw error;
  }
}

/*async runCronJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running cron job...');
    const connection = await connectToDatabase();
    
    const posts = await getPosts(connection);
    await postToInstagram(posts);
    
    await readWall(connection);
    
    await saveMessages(connection);

    connection.end(); // Close the database connection
    console.log('Cron job completed.');
  });
}*/




// module.exports = apiClient;
