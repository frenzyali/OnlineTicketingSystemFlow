import inquirer from 'inquirer';
import chalk from 'chalk';

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    isAdmin?: boolean;
}

interface SeatingOption {
    type: string;
    price: number;
    availableTickets: number;
}

interface Event {
    id: number;
    name: string;
    date: string;
    venue: string;
    description: string;
    ticketPrice: number;
    availableTickets: number;
    category: string;
    seatingOptions: SeatingOption[];
}

const users: User[] = [
    { id: 1, name: 'Admin', email: 'admin@gmail.com', password: 'admin123', isAdmin: true }
];
const events: Event[] = [
    {   id: 1,
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
    {   id: 2, 
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

let currentUser: User | null = null;

const mainMenu = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: ['Register', 'Login', 'Browse Events', 'Exit'],
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
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
    }

    await mainMenu();
};

const register = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter your name:' },
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);

    const user: User = {
        id: users.length + 1,
        name: answers.name,
        email: answers.email,
        password: answers.password,
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

    if (user) {
        currentUser = user;
        console.log(`Login successful! Welcome, ${currentUser.name}`);
    } else {
        console.log('Invalid email or password');
    }
};

const browseEvents = async () => {
    if (!currentUser) {
        console.log('You need to login first.');
        return;
    }

    const filterAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'keyword',
            message: 'Enter a keyword to search for events (or press enter to view all):',
        },
        {
            type: 'input',
            name: 'category',
            message: 'Enter a category to filter by (or press enter to skip):',
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
const selectTickets = async (event: Event) => {
    const seatingChoices = event.seatingOptions.map(option => ({
        name: `${option.type} - $${option.price} (Available: ${option.availableTickets})`,
        value: option.type,
    }));

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

            await processPayment(selectedSeating.price * ticketQuantity)
        } else {
            console.log(chalk.redBright('Invalid ticket quantity.'));
        }
    }
};
const processPayment = async (amount: number) => {
    let paymentSuccessful = false;

    while (!paymentSuccessful) {
        const paymentInfo = await inquirer.prompt([
            { type: 'input', name: 'cardNumber', message: 'Enter your credit card number:' },
            { type: 'input', name: 'expiryDate', message: 'Enter the card expiry date (MM/YY):' },
            { type: 'input', name: 'cvv', message: 'Enter the card CVV:' },
            { type: 'number', name: 'amount', message: `Enter the amount to pay (Total: $${amount}):` }
        ]);

        const enteredAmount = paymentInfo.amount;

        if (enteredAmount < amount) {
            console.log(chalk.redBright(`Insufficient amount. Please enter at least $${amount}.`));
        } else {
            console.log(chalk.blue('Processing payment...'));
            console.log(chalk.green(`Payment of $${enteredAmount} was successful!`));
            console.log(chalk.green('You will receive a confirmation email and your e-ticket shortly.'));
            paymentSuccessful = true;
        }
    }
};

mainMenu();