import { Sequelize } from 'sequelize';

// Initialize a new Sequelize instance for SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.sqlite' // Path to the local database file
});

// Define the models for the database
const Property = sequelize.define('Property', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    }
});

const Overview = sequelize.define('Overview', {
    propertyId: {
        type: Sequelize.INTEGER,
        references: {
            model: Property,
            key: 'id'
        }
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

const ProcedureCard = sequelize.define('ProcedureCard', {
    propertyId: {
        type: Sequelize.INTEGER,
        references: {
            model: Property,
            key: 'id'
        }
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

const ProcessFlow = sequelize.define('ProcessFlow', {
    procedureCardId: {
        type: Sequelize.INTEGER,
        references: {
            model: ProcedureCard,
            key: 'id'
        }
    },
    steps: {
        type: Sequelize.JSON,
        allowNull: false
    }
});

// Sync the models with the database
const initializeDatabase = async () => {
    await sequelize.sync({ force: true }); // Use force: true for development to reset the database
};

export {
    sequelize,
    Property,
    Overview,
    ProcedureCard,
    ProcessFlow,
    initializeDatabase
};