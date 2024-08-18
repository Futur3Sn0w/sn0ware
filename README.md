# sn0ware
My strangely obscure frontend for my favorite software and other downloadables

### Why make this?
Welp, to make a long story short; I setup a lot of devices. Downloading software isn't really difficult, but tracking down all the setups from everywhere and having to search for each app can be a bit of a pain. So I made a small repo of my favorite software, and software that I may want to access later.

### What does it do?
Put simply, it's a script that parses a hand-curated JSON database of software, and creates cards for each in a searchable and filterable wall. where you can view information on any one app. Each entry is chosen and detailed by me, and each app has been tested and confirmed working by me. Most results in these early stages will include software I likely use with regularity, so you can trust that the apps are tested safe.

### How do I use it?
From the homepage, you can immediately see a list of apps in the database. You can search through the apps by their name with the top searchbar, or filter the apps by category or publisher from the sidebar.  
![image](https://github.com/user-attachments/assets/7ab78303-462b-46ad-bc1f-92bf6d3ae427)

Cards include the basic info (title, icon, publisher) at the top, followed by a short description, a 'compatible' badge if the software is marked as compatible with your OS, and a button linking directly to the app's download page. Cards marked with a blue dot are the most recently added, so you always know what's new.  
![image](https://github.com/user-attachments/assets/8c7f1fe6-43c7-43f7-a374-3afbdacd3bcf)

To view more information about an app, just click on it's card to show the expanded view:  
![image](https://github.com/user-attachments/assets/c9d7b69a-8bcd-44f6-95d9-6185e116ae71)

### Future plans
I'd love to add the ability to integrate with Winget or other package managers to automatically create a command to download all the software in one go. However, we're quite a ways off from this, if it is something I decide to add.  
Currently, I'm working on the ability to 'star' or save apps for later, as well as refining and adding to the database as I remember and find more software to add.  
The site is a WIP, so expect bugs and changes! 🐛
