# City Visited Maps

An interactive web application to track and visualize the districts you have visited in specific cities (currently supporting **Istanbul** and **Konya**). 

This project allows users to click on districts within a city map to mark them as visited. The maps are generated using D3.js with GeoJSON data, and the selected districts are saved locally in the browser so your progress is maintained across sessions. Users can also download an image of their completed map to share!

## Features
- Interactive SVG maps for Istanbul and Konya.
- Dynamic district labeling (labels hide automatically when space is constrained to prevent clutter, and appear on hover).
- Local storage support to save your visited districts automatically.
- Export functionality to download your map as an image.
- Responsive container scaling.

## Acknowledgements

This project was inspired by and built upon the excellent **[TurkeyVisited](https://github.com/ozanyerli/turkeyvisited)** repository created by [Ozan Yerli](https://github.com/ozanyerli).

We adapted the core D3.js mapping and local storage logic from the original Turkey map to create dedicated, highly-detailed district-level maps for individual cities, along with UI enhancements for hovering and responsive scaling. 
