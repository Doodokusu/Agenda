# Agenda

Agenda is a browser-based calendar application developed with HTML, CSS, and JavaScript. It supports monthly and weekly views, allowing users to manage their personal schedules with local data storage using IndexedDB (via Dexie.js). No backend or server setup is required.

## Features

- Monthly and weekly calendar views
- Add events with start time (optional end time)
- Chronological event listing per day
- Delete events with confirmation
- Data persistence via IndexedDB (offline support)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/doodokusu/agenda.git
   cd agenda
   ```

2. Open `main.html` in your web browser.

   > This project runs entirely in the browser. No build or server is required.

## File Structure

```
agenda/
├── main.html        # Main HTML layout
├── style.css        # Calendar and modal styling
├── index.js         # Application logic and IndexedDB operations
└── README.md        # Project documentation
```

## Technologies Used

- HTML, CSS, JavaScript (no frameworks)
- Dexie.js for IndexedDB
- Font Awesome (for optional icons)

## License

This project is licensed under the MIT License.
