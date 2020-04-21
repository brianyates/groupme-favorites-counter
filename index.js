const axios = require('axios');
const moment = require('moment');

// ***************** CHANGE THESE VALUES *****************
const GROUPME_API_KEY = '<YOUR API KEY>';
const GROUPME_GROUP_ID = '<YOUR GROUP ID>';
const TARGET_DATE = moment().subtract(10, 'days'); // Set the time window you'd like to count favorites for
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
            favoriteCounts[user_id] = { nickname, favoritesReceived: 0 };
        });
        let before_id;
        let params = { limit: 100 };
        while (true) {
            if (before_id) {
                params.before_id = before_id;
            }
            const res = await axios.get(createRoute('/messages', params));
            const messages = res.data.response.messages;
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
                    favoriteCounts[sender_id].favoritesReceived += favorited_by.length;
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
            favoritesReceived: favoriteCounts[key].favoritesReceived
        }
    })
    .sort((a, b) => {
        if (a.favoritesReceived > b.favoritesReceived) {
            return -1;
        }
        return 1;
    })
    console.log(sortedCounts);
})
.catch(err => console.log(err.message))
