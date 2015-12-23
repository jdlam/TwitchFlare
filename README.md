# [TwitchFlare](https://twitch-flare.herokuapp.com)

TwitchFlare is a visual representation of the top games on the Twitch.tv platform. The app gathers data every hour, and displays it within a Sunburst Chart, which allows users to see trends between not only the top games throughout the day, but also streamers that are competing with each other.

![TwitchFlare Demo](https://fat.gfycat.com/VelvetyAggravatingIrrawaddydolphin.gif)

# Approach

TwitchFlare only visualizes the past 24 hours worth of data, each hour at a time. This is due to restrictions on storing data from Twitch, as stated in their [Terms of Service Article 12 Section b](http://www.twitch.tv/user/legal?page=api_terms_of_service). With that said, I focused on three main points for this project:

### 1) Retrieving and Storing Data

Via the Twitch API, I was able to get the most current data about the games their streamers show. Unfortunately, the API has multiple endpoints for different pieces of data. I used ajax calls to get the data for the top games at that point in time, and then. This only gave me data on the specific games though, so I made a separate ajax call for each of the games to find its top 10 streamers with the most views, and then store the relevant information in Mongo as a single document.

![Parsed Twitch.tv API Data](http://imgur.com/CS9hedC.png)

D3js requires data to be formatted in a specific manner for each type of chart, so I spent just as much time on parsing my data properly as I did on making my charts visually attractive. This is all happening in the background on the server, thanks to [Node-Schedule](https://github.com/tejasmanohar/node-schedule/blob/master/README.md), which allowed me to set up a CRON Job, or a recurring task.

### 2) Visualizing Data from the Past 24 Hours

Using a Sunburst chart, I was able to show my data, not only by count, but by size, or number of viewers. Since I didn't want to pull in data for 400+ games and 1000+ streams for each of the top games, I limited my API calls to only 6 games, and 10 streams. The data I pulled only shows the top 10 streams ranked by viewership.

![TwitchFlare Size Setting](http://imgur.com/2C2oceH.png)

### 3) Making the Data Interactive and Visually Appealing

With only the size and the count settings, I thought that the chart gets cluttered, especially for the games with less viewership, such as ArmA II and Destiny. Games like League of Legends, Dota 2, and Counter-Strike: Global Offensive will always have higher viewership since they're more popular. Thus, I added the ability to zoom in on each entry in the chart.

You can zoom in by clicking on a section, or zoom out by clicking on the center of the chart. I also added in a tooltip window that automatically updates with the stream or game's information and logo.

![TwitchFlare is Zoomable](http://imgur.com/L3YFSQe.png)

# Technologies Used

  - HTML
  - CSS
  - JavaScript
  - jQuery
  - MongoDB
  - Express
  - Node.js
  - [Node-Schedule](https://github.com/tejasmanohar/node-schedule/blob/master/README.md)
  - [Twitch.tv's API](https://github.com/justintv/twitch-api)
  - [D3js](https://github.com/mbostock/d3/wiki)

# Notes

Author: Jonathan Lam
Last Updated: 10/16/15

# Plans for Future Versions

- Ensuring bad data doesn't enter the database
- Ensuring bad data doesn't break the chart
- Dynamically updating a table at the bottom, updating with data about that specific game
