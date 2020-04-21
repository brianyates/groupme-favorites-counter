### GroupMe Favorites Counter

This script requires Node.js version 7.6 or higher. 

# Step 1 - Clone the repository
`git clone https://github.com/brianyates/groupme-favorites.git`

# Step 2 - Install dependencies
`npm install`

# Step 3 - Replace lines 5-7 of index.js with the necessary GroupMe API key, group ID and timespan you wish to cover
`// ***************** CHANGE THESE VALUES *****************`
`const GROUPME_API_KEY = '<YOUR API KEY>';`
`const GROUPME_GROUP_ID = '<YOUR GROUP ID>';`
`const TARGET_DATE = moment().subtract(10, 'days'); // Set the time window you'd like to count favorites for`
`// *******************************************************`

# Step 4 - Run the script
`npm start`