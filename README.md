# QuickCash

## Project Description
QuickCash is a financial management application that aims to simplify budgeting, tracking expenses, and managing personal finances. The intuitive interface allows users to have a clear overview of their financial status and encourages better spending habits.

## Features
- **Expense Tracking**: Log expenses with categories and notes.
- **Budget Planning**: Set monthly budgets and receive alerts for overspending.
- **Reports**: Generate visual reports of spending patterns and trends.
- **Multi-Currency Support**: Manage expenses in various currencies.
- **User Authentication**: Secure user accounts with login and registration functionality.

## Tech Stack
- **Frontend**: React.js for building dynamic user interfaces.
- **Backend**: Node.js with Express for server-side logic.
- **Database**: MongoDB for storing user and transaction data.
- **Authentication**: JSON Web Tokens (JWT) for secure user sessions.

## Project Structure
```
QuickCash
├── client/                # Frontend code
│   ├── src/              # React components
│   ├── public/           # Static files
├── server/                # Backend code
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
└── README.md             # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Ergi550/QuickCash.git
   cd QuickCash
   ```
2. Install dependencies:
   - For the client:
     ```bash
     cd client
     npm install
     ```
   - For the server:
     ```bash
     cd server
     npm install
     ```
3. Start the application:
   - For the server:
     ```bash
     cd server
     npm start
     ```
   - For the client:
     ```bash
     cd client
     npm start
     ```

## Contribution Guidelines
We welcome contributions! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/MyFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/MyFeature
   ```
5. Open a pull request detailing your changes and why they should be merged.

Happy coding!