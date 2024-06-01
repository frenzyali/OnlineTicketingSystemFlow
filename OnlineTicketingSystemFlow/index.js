#! /usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
console.log(chalk.yellowBright(figlet.textSync("Ali's ticketing System", { horizontalLayout: 'full' })));
const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com', password: 'admin123', phone: '12345678910', isAdmin: true } // Actual Users Array and it has a predefined
]; // value of admin.
const events = [
    { id: 1,
        name: 'Concert',
        date: '2024-06-15',
        venue: 'Stadium',
        description: 'A great concert.',
        ticketPrice: 50, availableTickets: 100,
        category: 'Music',
        seatingOptions: [
            { type: 'VIP', price: 100, availableTickets: 20 },
            { type: 'Regular', price: 50, availableTickets: 100 }
        ]
    },
    { id: 2,
        name: 'Play',
        date: '2024-07-20',
        venue: 'Theater',
        description: 'An amazing play.',
        ticketPrice: 30,
        availableTickets: 50,
        category: 'Theater',
        seatingOptions: [
            { type: 'Front Row', price: 70, availableTickets: 10 },
            { type: 'Standard', price: 30, availableTickets: 40 }
        ]
    },
];
let currentUser = null; // Before Logging in, the current user is set to null.
const mainMenu = async () => {
    const choices = currentUser && currentUser.isAdmin
        ? ['Register', 'Login', 'Browse Events', 'Admin Menu', 'Exit']
        : ['Register', 'Login', 'Browse Events', 'Admin Login', 'Exit']; // Turnary operator used here as a if-else condition
    // The condition is if the user is logged in and has admin powers, then they
    // will have the admin menu prompt as well. Otherwise, they will not.
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: chalk.yellowBright('Choose an action:'),
            choices: choices,
        },
    ]);
    switch (answers.action) {
        case 'Register':
            await register();
            break;
        case 'Login':
            await login();
            break;
        case 'Browse Events':
            await browseEvents();
            break;
        case 'Admin Login':
            await adminLogin();
            break;
        case 'Admin Menu':
            await adminMenu();
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
    }
    await mainMenu();
};
const register = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter your name:',
            validate: input => {
                if (input.length < 3 || input.length > 15) {
                    return 'Name must be between 3 and 15 characters.';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email:',
            validate: input => {
                if (!input.includes('@')) {
                    return 'Email must contain an @ symbol.';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'password',
            message: 'Enter your password:',
            validate: input => {
                if (input.length < 6 || input.length > 10) {
                    return 'Password must be between 6 and 10 characters.';
                }
                return true;
            }
        },
        {
            type: 'number',
            name: 'phone',
            message: 'Enter your phone number:',
            validate: input => {
                const phoneStr = input.toString();
                if (phoneStr.length !== 10) {
                    return 'Phone number must be exactly 11 digits.';
                }
                return true;
            }
        }
    ]);
    const existingUser = users.find(u => u.email === answers.email);
    if (existingUser) {
        console.log(chalk.redBright('Email already registered. Please use a different email.'));
        return;
    }
    const user = {
        id: users.length + 1,
        name: answers.name,
        email: answers.email,
        password: answers.password,
        phone: answers.phone.toString()
    };
    users.push(user);
    console.log('Registration successful!');
};
const login = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    const user = users.find(u => u.email === answers.email && u.password === answers.password);
    if (user) { // Login Registeration
        currentUser = user;
        console.log(`Login successful! Welcome, ${currentUser.name}`);
    }
    else {
        console.log('Invalid email or password');
    }
};
const adminLogin = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter admin email:' },
        { type: 'password', name: 'password', message: 'Enter admin password:' },
    ]);
    const admin = users.find(u => u.email === answers.email && u.password === answers.password && u.isAdmin);
    if (admin) {
        currentUser = admin;
        console.log(chalk.green(`Admin login successful! Welcome, ${currentUser.name}`));
        await adminMenu();
    }
    else {
        console.log(chalk.redBright('Invalid admin email or password'));
    }
};
const browseEvents = async () => {
    const filterAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'keyword',
            message: 'Enter a keyword to search for events (or press enter to view all):',
        },
        {
            type: 'input',
            name: 'category',
            message: 'Enter a category to filter by (or press enter to skip):', // It first takes prompts and gathers the users choices
        },
        {
            type: 'input',
            name: 'date',
            message: 'Enter a date to filter by (YYYY-MM-DD or press enter to skip):',
        },
    ]);
    const filteredEvents = events.filter(event => {
        return (!filterAnswers.keyword || event.name.toLowerCase().includes(filterAnswers.keyword.toLowerCase()) || event.description.toLowerCase().includes(filterAnswers.keyword.toLowerCase())) &&
            (!filterAnswers.category || event.category.toLowerCase() === filterAnswers.category.toLowerCase()) &&
            (!filterAnswers.date || event.date === filterAnswers.date);
    });
    // After gathering, it checks the prompts in the events variables and checks them if they are true or not
    // If you skip all of the choices, you will get all of the events shown
    if (filteredEvents.length === 0) {
        console.log('No events found with the given criteria.');
        return;
    }
    const eventChoices = filteredEvents.map(event => ({
        name: `${event.name} on ${event.date} at ${event.venue} - ${event.description}`,
        value: event.id
    }));
    const eventAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'eventId',
            message: 'Select an event to view details:',
            choices: eventChoices,
        },
    ]);
    const selectedEvent = events.find(event => event.id === eventAnswer.eventId);
    if (selectedEvent) {
        console.log(`\nEvent Details:
Name: ${selectedEvent.name}
Date: ${selectedEvent.date}
Venue: ${selectedEvent.venue}
Description: ${selectedEvent.description}\n`);
        await selectTickets(selectedEvent);
    }
};
const selectTickets = async (event) => {
    const seatingChoices = event.seatingOptions.map(option => ({
        name: `${option.type} - $${option.price} (Available: ${option.availableTickets})`,
        value: option.type,
    })); // This is the function for ticket selecting.
    // It lets the select the number of tickets, which ticket and seating type!
    const seatingAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'seatingType',
            message: 'Select a seating type:',
            choices: seatingChoices,
        },
    ]);
    const selectedSeating = event.seatingOptions.find(option => option.type === seatingAnswer.seatingType);
    if (selectedSeating && selectedSeating.availableTickets === 0) {
        console.log(chalk.redBright(`Unfortunately, there are no tickets available for ${selectedSeating.type}.`));
        return;
    }
    if (!currentUser) {
        console.log(chalk.redBright('You need to login or register if you are not a existing user!'));
        return;
    }
    if (selectedSeating) {
        const ticketAnswer = await inquirer.prompt([
            {
                type: 'number',
                name: 'ticketQuantity',
                message: `Enter the number of tickets for ${selectedSeating.type}:`,
                validate: (input) => {
                    if (input < 1 || input > selectedSeating.availableTickets) {
                        return `Please enter a quantity between 1 and ${selectedSeating.availableTickets}.`;
                    }
                    return true;
                }
            }
        ]);
        const ticketQuantity = ticketAnswer.ticketQuantity;
        if (ticketQuantity > 0 && ticketQuantity <= selectedSeating.availableTickets) {
            selectedSeating.availableTickets -= ticketQuantity;
            console.log(chalk.green(`Successfully purchased ${ticketQuantity} ${selectedSeating.type} tickets for ${event.name}.`));
            await processPayment(selectedSeating.price * ticketQuantity);
        }
        else {
            console.log(chalk.redBright('Invalid ticket quantity.'));
        }
    }
};
const processPayment = async (amount) => {
    let paymentSuccessful = false;
    while (!paymentSuccessful) {
        const paymentInfo = await inquirer.prompt([
            { type: 'input', name: 'cardNumber', message: 'Enter your credit card number:' },
            { type: 'input', name: 'expiryDate', message: 'Enter the card expiry date (MM/YY):' },
            { type: 'input', name: 'cvv', message: 'Enter the card CVV:' },
            { type: 'number', name: 'amount', message: `Enter the amount to pay (Total: $${amount}):` }
        ]);
        const enteredAmount = paymentInfo.amount;
        // Function for payment processing!
        if (enteredAmount < amount) {
            console.log(chalk.redBright(`Insufficient amount. Please enter at least $${amount}.`));
        }
        else {
            setTimeout(() => {
                console.log(chalk.blue('Processing payment...'));
            }, 2000);
            console.log(chalk.green(`Payment of $${enteredAmount} was successful!`));
            console.log(chalk.green('You will receive a confirmation email and your e-ticket shortly.'));
            paymentSuccessful = true;
        }
    }
};
const adminMenu = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'adminAction',
            message: 'Admin Menu - Choose an action:',
            choices: ['Create Event', 'Edit Event', 'Delete Event', 'Back to Main Menu'],
        },
    ]);
    switch (answers.adminAction) {
        case 'Create Event':
            await createEvent();
            break;
        case 'Edit Event':
            await editEvent();
            break;
        case 'Delete Event':
            await deleteEvent();
            break;
        case 'Back to Main Menu':
            return;
    }
    await adminMenu();
};
const createEvent = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter event name:' },
        { type: 'input', name: 'date', message: 'Enter event date (YYYY-MM-DD):' },
        { type: 'input', name: 'venue', message: 'Enter event venue:' },
        { type: 'input', name: 'description', message: 'Enter event description:' },
        { type: 'number', name: 'ticketPrice', message: 'Enter ticket price:' },
        { type: 'number', name: 'availableTickets', message: 'Enter number of available tickets:' },
        { type: 'input', name: 'category', message: 'Enter event category:' },
    ]);
    const eventDate = new Date(`${answers.date}T00:00`);
    if (eventDate <= new Date()) { // This is the function for creating events(for admin users)
        console.log(chalk.redBright('Event date must be in the future.'));
        return;
    }
    const seatingOptions = [];
    let addMoreSeating = true;
    while (addMoreSeating) {
        const seatingAnswers = await inquirer.prompt([
            { type: 'input', name: 'type', message: 'Enter seating type (e.g., VIP, Regular):' },
            { type: 'number', name: 'price', message: 'Enter price for this seating type:' },
            { type: 'number', name: 'availableTickets', message: 'Enter number of available tickets for this seating type:' },
            { type: 'confirm', name: 'addMore', message: 'Do you want to add another seating type?', default: false },
        ]);
        seatingOptions.push({
            type: seatingAnswers.type,
            price: seatingAnswers.price,
            availableTickets: seatingAnswers.availableTickets,
        });
        addMoreSeating = seatingAnswers.addMore;
    }
    const event = {
        id: events.length + 1,
        name: answers.name,
        date: answers.date,
        venue: answers.venue,
        description: answers.description,
        ticketPrice: answers.ticketPrice,
        availableTickets: answers.availableTickets,
        category: answers.category,
        seatingOptions: seatingOptions,
    };
    events.push(event);
    console.log(chalk.green('Event created successfully!'));
};
const editEvent = async () => {
    if (events.length === 0) {
        console.log(chalk.redBright('No events available to edit.'));
        return;
    }
    const eventChoices = events.map(event => ({
        name: `${event.name} on ${event.date} at ${event.venue}`,
        value: event.id,
    }));
    const eventAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'eventId',
            message: 'Select an event to edit:',
            choices: eventChoices,
        },
    ]);
    const selectedEvent = events.find(event => event.id === eventAnswer.eventId);
    if (!selectedEvent) {
        console.log(chalk.redBright('Event not found.'));
        return;
    }
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: `Enter new name (current: ${selectedEvent.name}):`, default: selectedEvent.name },
        { type: 'input', name: 'date', message: `Enter new date (YYYY-MM-DD) (current: ${selectedEvent.date}):`, default: selectedEvent.date },
        { type: 'input', name: 'venue', message: `Enter new venue (current: ${selectedEvent.venue}):`, default: selectedEvent.venue },
        { type: 'input', name: 'description', message: `Enter new description (current: ${selectedEvent.description}):`, default: selectedEvent.description },
        { type: 'number', name: 'ticketPrice', message: `Enter new ticket price (current: ${selectedEvent.ticketPrice}):`, default: selectedEvent.ticketPrice },
        { type: 'number', name: 'availableTickets', message: `Enter new number of available tickets (current: ${selectedEvent.availableTickets}):`, default: selectedEvent.availableTickets },
        { type: 'input', name: 'category', message: `Enter new category (current: ${selectedEvent.category}):`, default: selectedEvent.category },
    ]);
    const eventDate = new Date(`${answers.date}T00:00`);
    if (eventDate <= new Date()) {
        console.log(chalk.redBright('Event date must be in the future.'));
        return;
    }
    selectedEvent.name = answers.name;
    selectedEvent.date = answers.date;
    selectedEvent.venue = answers.venue;
    selectedEvent.description = answers.description;
    selectedEvent.ticketPrice = answers.ticketPrice;
    selectedEvent.availableTickets = answers.availableTickets;
    selectedEvent.category = answers.category;
    console.log(chalk.green('Event updated successfully!'));
};
const deleteEvent = async () => {
    if (events.length === 0) {
        console.log(chalk.redBright('No events available to delete.'));
        return;
    }
    const eventChoices = events.map(event => ({
        name: `${event.name} on ${event.date} at ${event.venue}`,
        value: event.id,
    }));
    const eventAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'eventId',
            message: 'Select an event to delete:',
            choices: eventChoices,
        },
    ]);
    const eventIndex = events.findIndex(event => event.id === eventAnswer.eventId);
    if (eventIndex === -1) {
        console.log(chalk.redBright('Event not found.'));
        return;
    }
    events.splice(eventIndex, 1);
    console.log(chalk.green('Event deleted successfully!'));
};
mainMenu();
