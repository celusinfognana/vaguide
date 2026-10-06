# Existing Application

## Overview
This project is an existing application that has been enhanced with admin/management functionality. The management features allow for the creation, editing, and management of properties, overviews, and procedure cards, all while using the same authentication system as the existing application.

## Features
- **Admin/Management UI**: A dedicated interface for managing properties and procedure cards.
- **Properties / Collections Management**: Add, edit, save, and delete properties and collections.
- **Property Overview**: Create and manage overviews for each property.
- **Procedure Cards**: Add, edit, save, and delete procedure cards within properties.
- **Process Flow Builder**: Create and manage process flows within procedure cards, including steps and decision branches.

## File Structure
The project is organized as follows:

```
existing-app
├── src
│   ├── app.ts                     # Entry point of the application
│   ├── management                  # Management functionality
│   │   ├── components              # UI components for management
│   │   │   ├── PropertyManager.ts   # Manage properties
│   │   │   ├── OverviewEditor.ts    # Edit property overviews
│   │   │   ├── ProcedureCardEditor.ts # Manage procedure cards
│   │   │   └── ProcessFlowBuilder.ts # Build process flows
│   │   ├── pages                   # Management pages
│   │   │   └── ManagementPage.ts    # Main management UI
│   │   ├── services                # API services for management
│   │   │   └── managementApi.ts     # API interactions
│   │   └── types.ts                # Type definitions for management
│   └── existing                    # Existing application logic
│       └── auth.ts                 # Authentication logic
├── server
│   ├── routes                      # API routes
│   │   └── management.ts            # Management API routes
│   ├── services                    # Business logic services
│   │   └── managementService.ts      # Management service logic
│   └── storage                     # Database and storage
│       ├── database.ts              # Database setup
│       └── schema.ts                # Database schema definitions
├── data
│   └── .gitkeep                    # Keep data directory in version control
├── package.json                    # NPM configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

## Setup Instructions
1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies using `npm install`.
4. Start the application with `npm start`.

## Usage
- Access the management functionality through the existing application interface.
- Use the admin UI to manage properties, overviews, and procedure cards.
- All changes are persisted in the local database, ensuring data integrity across sessions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.