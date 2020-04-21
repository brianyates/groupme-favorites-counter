const axios = require('axios');
const moment = require('moment');

// ***************** CHANGE THESE VALUES *****************
const GROUPME_API_KEY = require('./config').GROUPME_API_KEY;
const GROUPME_GROUP_ID = require('./config').GROUPME_GROUP_ID;
const TARGET_DATE = moment().subtract(241, 'days'); // Set the time window moment object to tell the script when to stop
const SORT_PARAMETER = 'favoritesGiven'; // Possible options are 'favoritesGiven', 'favoritesReceived', 'totalMessages', 'ratio'
// *******************************************************

const createRoute = (endpoint='', params='') => {
    if (params) {
        params = '&' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    }
    return `https://api.groupme.com/v3/groups/${GROUPME_GROUP_ID}${endpoint}?token=${GROUPME_API_KEY}${params}`;
};

let messageCount = 0;
async function getFavoriteCounts() {
    try {
        let favoriteCounts = {};
        const { data: { response: { members } } } = await axios.get(createRoute());
        members.forEach(({ user_id, nickname }) => {
            favoriteCounts[user_id] = { nickname, favoritesReceived: 0, totalMessages: 0, favoritesGiven: 0 };
        });
        let before_id;
        let params = { limit: 100 };
        while (true) {
            if (before_id) {
                params.before_id = before_id;
            }
            const { data: { response: { messages } } } = await axios.get(createRoute('/messages', params));
            if (!messages || messages.length === 0) {
                return favoriteCounts;
            }
            for (let i = 0; i < messages.length; i++) {
                messageCount++;
                const { sender_id, favorited_by, created_at } = messages[i];
                if (moment(created_at * 1000).isBefore(TARGET_DATE)) {
                    return favoriteCounts;
                }
                if (favoriteCounts[sender_id]) {
                    favoriteCounts[sender_id].totalMessages += 1;
                    favoriteCounts[sender_id].favoritesReceived += favorited_by.length;
                    favorited_by.forEach(user_id => {
                        if (favoriteCounts[user_id]) {
                            favoriteCounts[user_id].favoritesGiven += 1;
                        }
                    })
                }
            }
            process.stdout.write(`Fetching messages: ${messageCount} total messages processed\r`);
            before_id = messages.slice(-1)[0].id;
        }
    }
    catch (err) {
        throw err;
    }
}

getFavoriteCounts()
.then(favoriteCounts => {
    process.stdout.write(`Finished fetching messages: ${messageCount} total messages processed\n`);
    const sortedCounts = Object.keys(favoriteCounts)
    .map(key => {
        return {
            nickname: favoriteCounts[key].nickname, 
            favoritesReceived: favoriteCounts[key].favoritesReceived,
            totalMessages: favoriteCounts[key].totalMessages,
            favoritesGiven: favoriteCounts[key].favoritesGiven,
            ratio: favoriteCounts[key].totalMessages > 0 ? favoriteCounts[key].favoritesReceived / favoriteCounts[key].totalMessages : 0
        }
    })
    .sort((a, b) => {
        if (a[SORT_PARAMETER] > b[SORT_PARAMETER]) {
            return -1;
        }
        return 1;
    })
    console.log(sortedCounts.map(item => ({...item, ratio: item.ratio.toFixed(2)})));
})
.catch(err => console.log(err.message))
