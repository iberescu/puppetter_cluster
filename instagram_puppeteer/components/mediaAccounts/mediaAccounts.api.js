const serverLibrary = require('../../libraries/server.js');

const MediaAccountsAPI = {
	postFollower: async (request,reply) => {
		let serverRequested = new serverLibrary.server();
		const instagramFollowersCount = await serverRequested.getFollowers(request, reply);
		reply.send(instagramFollowersCount);
	},
	postCreateInstagramPost: async (request,reply) => {
		let serverRequested = new serverLibrary.server();
		const createPost = await serverRequested.createInstagramPost(request, reply);
		reply.send(createPost);
	},
	postSendReadInstagramMessage: async (request,reply) => {
		let serverRequested = new serverLibrary.server();
		const createPost = await serverRequested.sendReadInstagramMessage(request, reply);
		reply.send(createPost);
	},
	postFollowInstagramUser: async (request,reply) => {
		let serverRequested = new serverLibrary.server();
		const createPost = await serverRequested.followInstagramUser(request, reply);
		reply.send(createPost);
	}
}
module.exports = MediaAccountsAPI;
