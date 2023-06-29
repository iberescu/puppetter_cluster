const fs = require('fs');
const client = require('https');
const cron = require("node-cron");
const mysql = require(`mysql-await`);
const server = require('../../libraries/server.js');
var axios = require('axios');



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
    const [rows] = await connection.awaitQuery('SELECT * FROM posts WHERE timestamp > ?', [currentTime]);
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
      const postData = JSON.stringify({
        "url": "https://www.instagram.com/harperdavid405/",
        "imageUrl": post.post_image,
        "commands": [
          {
            "type": "createPost"
          }
        ],
        "captionText": post.post_content
      });

      const config = {
        method: 'post',
        url: 'localhost:8000/mediaAccounts/createinstagrampost',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : postData
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

      // await client.post(postData);
      console.log('Posted on Instagram:', post);
    }
  } catch (error) {
    console.error('Error posting on Instagram:', error.message);
    throw error;
  }
}

async function scrollWall(connection) {
  try {
    const [rows] = await connection.awaitQuery('SELECT username, x, y, z FROM users_accounts');
    for (const user of rows) {
      const scrollWallData = JSON.stringify({
        "url": "https://www.instagram.com/"+user.username,
        "commands": [
          {
            "type": "scrollWall",
            "scrollNumber": user.x,
            "postToLike": user.y,
            "waitTimeAfterScroll": user.z
          }
        ]
      });

      const config = {
        method: 'post',
        url: 'http://localhost:8001/api/scrollwall',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : scrollWallData
      };

      // Send read wall request every 2 hours for each user
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });

      // await client.post(scrollWallData);
      console.log('Read wall request sent for user:', user.username);
    }
  } catch (error) {
    console.error('Error reading wall:', error.message);
    throw error;
  }
}

async function saveMessages(connection) {
  try {
    const messageData = JSON.stringify({
      "url": "https://www.instagram.com/",
      "commands": [
        {
          "type": "readMessage",
          "messageCount": 5
        }
      ]
    });

    const config = {
      method: 'post',
      url: 'localhost:8000/mediaAccounts/sendreadinstagrammessage',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : messageData
    };
    axios(config)
      .then(function (response) {
        let messages = JSON.stringify(response.data);

        for (const message of messages) {
          // Save the message in the msg table with a user parent column
          await connection.awaitQuery('INSERT INTO msg (user, message) VALUES (?, ?)', [message.user, message.message]);
          console.log('Message saved:', message);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    
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
