# Agenda
Agenda is a browser-based calendar application developed with HTML, CSS, and JavaScript. It allows users to create, view, and manage daily events in both monthly and weekly formats. All data is stored locally using IndexedDB via the Dexie.js library, ensuring offline functionality without requiring a backend server.

Features
Switch between monthly and weekly calendar views

Add events with start time (and optionally end time)

Display events in chronological order for each day

Delete events with a confirmation modal

Store all event data locally in the browser (no login or external server)

Installation
Clone the repository:
git clone https://https://github.com/Doodokusu/Agenda.git
cd agenda
Open main.html with any modern browser.

No build process or server setup is required. This project runs entirely in the browser.

File Structure
agenda/
├── main.html       # HTML layout for the application
├── style.css       # Styling for calendar views and modals
├── index.js        # JavaScript logic, event handling, database integration
└── README.md       # Project documentation
Technologies Used
HTML, CSS, and Vanilla JavaScript

Dexie.js for IndexedDB interaction

Font Awesome (for modal icons)

License
This project is licensed under the MIT License.
