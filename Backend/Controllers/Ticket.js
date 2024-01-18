const pool = require('../Config/database.js')
const uuid = require('uuid'); 

function shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
  }
  

function generateSingleTicket() {
    const ticket = [];
    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    numbers.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
        const row = Array(9).fill(0);
        let count = 0;
        for (let j = 0; j < 9; j++) {
            if (numbers.length > 0 && count< 5) {
                row[j] = numbers.pop();
                count++;
            }
        }
        shuffleArray(row)
        const customSort = (a, b) => {
            if (a === 0 || b === 0) {
                return 0;
            }
            
            return a - b;
        };
        row.sort(customSort);
        ticket.push(row);
    }

    return ticket;
}

exports.generateTicket = async (req, res) => {

    try {
        const { numSets } = req.body;
        const tambolaSets = {};

        const connection = await pool.getConnection();

        for (let setNum = 1; setNum <= numSets; setNum++) {
            const tickets = {};

            for (let i = 0; i < 6; i++) {
                const ticketId = uuid.v4();
                const ticketData = generateSingleTicket();
                tickets[ticketId] = ticketData;
            }
    
            // Save the ticket in the database using connection from the pool
            await connection.query(
                'INSERT INTO tambola_tickets (tickets) VALUES (?)',
                [JSON.stringify(tickets)]
            );
        }

        // Release the connection back to the pool
        connection.release();

        res.json({ message: 'Tambola tickets generated and saved successfully!' });
    } catch (error) {
        // console.error('Error generating tickets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const calculateTotalPages = (totalRecords, pageSize) => Math.ceil(totalRecords / pageSize);

exports.getTicket = async (req, res) => {

   try {
    const { pageSize, pageNumber } = req.params;
    const offset = (pageNumber - 1) * pageSize;

    
        // Fetch total number of records for pagination calculation
        const [countResult] = await pool.query('SELECT COUNT(*) as totalCount FROM tambola_tickets');
        const totalCount = countResult[0].totalCount;
       
        // Calculate total number of pages
        const totalPages = calculateTotalPages(totalCount, pageSize);

    // Fetch tickets from the database with pagination using the pool
    const results = await pool.query(
        'SELECT tickets as Tickets FROM tambola_tickets',
        // [parseInt(pageSize, 10), offset]
    );

    const response = {
        ticket: results[0],
        pagination: {
            pageSize: parseInt(pageSize, 10),
            pageNumber: parseInt(pageNumber, 10),
            totalPages: totalPages,
            totalCount: totalCount
        }
    };

    res.json(response)
 

} catch (error) {
    // console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}

}

