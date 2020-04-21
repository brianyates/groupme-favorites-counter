# GroupMe Favorites Counter

This project is a basic script written in Node.js which can be used to count the number of favorites received by each user in a GroupMe chat over a pretermined period of time. It requires Node.js version 7.6 or higher. Follow the steps below to install and run the script.

### Step 1 - Clone the repository, then change into the directory
```
git clone https://github.com/brianyates/groupme-favorites-counter.git
cd groupme-favorites-counter
```

### Step 2 - Install dependencies
`npm install`

### Step 3 - Replace lines 5-7 of index.js with the necessary GroupMe API key, group ID and timespan you wish to cover
```
// ***************** CHANGE THESE VALUES *****************
const GROUPME_API_KEY = '<YOUR API KEY>';
const GROUPME_GROUP_ID = '<YOUR GROUP ID>';
const TARGET_DATE = moment().subtract(10, 'days'); // Set the time window moment object for which you'd like to count favorites 
// *******************************************************
```

### Step 4 - Run the script
`npm start`
