const path = require('path');
const express = require('express');
const cors = require('cors');
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders');
const PasswordResetRequest = require('./models/passwordResetRequest'); // Import new model

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature');
const forgotPasswordRoutes = require('./routes/forgotPassword'); // Import new routes
const resetPasswordRoutes = require('./routes/resetPassword'); // Import reset password routes


require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());  //this is for handling JSON
app.use(express.urlencoded({ extended: true })); 


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Signup/signup.html'));
});

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/user', forgotPasswordRoutes); // Add new routes
app.use('/user', resetPasswordRoutes); // Add reset password routes

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(PasswordResetRequest); // Establish relationship
PasswordResetRequest.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.log(err);
    });
