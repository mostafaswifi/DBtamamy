import express from 'express';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import cors from 'cors'




const prisma = new PrismaClient().$extends(withAccelerate())





const app = express();
const port = 3001;


app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});


// Employee Endpoints

// GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET a single employee by ID
app.get('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { attendanceDepartures: true }, // Include attendance records for the employee
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST a new employee
app.post('/api/employees', async (req, res) => {
  const { employeeName, employeeCode, hireDate, department, jobTitle } = req.body;
  try {
    const newEmployee = await prisma.employee.create({
      data: {
        employeeName,
        employeeCode,
        hireDate: hireDate ? new Date(hireDate) : null,
        department,
        jobTitle,
      },
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT (update) an existing employee by ID
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { employeeName, employeeCode, department, jobTitle } = req.body;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        employeeName,
        employeeCode,
        department,
        jobTitle,
      },
    });
    res.json(updatedEmployee);
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    res.status(404).json({ error: 'Employee not found or failed to update' });
  }
 console.log(id,employeeName, employeeCode, department, jobTitle);
});

// DELETE an employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    res.status(404).json({ error: 'Employee not found or failed to delete' });
  }
});

// AttendanceDeparture Endpoints

// GET all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendanceDeparture.findMany({
      include: { employee: true }, // Include employee details
    });
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// GET attendance records for a specific employee
app.get('/api/employees/:employeeId/attendance', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const attendanceRecords = await prisma.attendanceDeparture.findMany({
      where: { employeeId: parseInt(employeeId) },
    });
    res.json(attendanceRecords);
  } catch (error) {
    console.error(`Error fetching attendance for employee ${employeeId}:`, error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// POST a new attendance/departure record
// POST a new attendance/departure record
app.post('/api/attendance', async (req, res) => {
  // Correctly destructure from req.body directly
  const { employeeId, cordx, cordy } = req.body; // <--- CORRECTED

  try {
    // Validate required fields
    if (employeeId === undefined || isNaN(parseInt(employeeId)) || cordx === undefined || isNaN(parseFloat(cordx)) || cordy === undefined || isNaN(parseFloat(cordy))) {
      return res.status(400).json({ error: 'Missing or invalid employeeId, cordx, or cordy' });
    }

    const newAttendance = await prisma.attendanceDeparture.create({
      data: {
        employeeId: parseInt(employeeId),
        cordx: parseFloat(cordx),
        cordy: parseFloat(cordy),
      },
    });
    res.status(201).json(newAttendance);

  } catch (error) {
    console.error('Error creating attendance record:', error);
    // Be more specific if it's a Prisma validation error (e.g., employeeId not found)
    if (error.code === 'P2003') { // Foreign key constraint failed
        res.status(400).json({ error: 'Employee not found with the provided ID' });
    } else {
        res.status(500).json({ error: 'Failed to create attendance record' });
    }
  }
});

// PUT (update) an existing attendance/departure record by ID
app.put('/api/attendance/:id', async (req, res) => {
  const { id } = req.params;
  const { employeeId, attendanceTime, departureTime, attendanceStatus, departureStatus, notes } = req.body;
  try {
    const updatedAttendance = await prisma.attendanceDeparture.update({
      where: { id: parseInt(id) },
      data: {
        employeeId: employeeId ? parseInt(employeeId) : undefined,
        attendanceTime: attendanceTime ? new Date(attendanceTime) : undefined,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        attendanceStatus,
        departureStatus,
        notes,
      },
    });
    res.json(updatedAttendance);
  } catch (error) {
    console.error(`Error updating attendance record with ID ${id}:`, error);
    res.status(404).json({ error: 'Attendance record not found or failed to update' });
  }
});

// DELETE an attendance/departure record by ID
app.delete('/api/attendance/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.attendanceDeparture.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting attendance record with ID ${id}:`, error);
    res.status(404).json({ error: 'Attendance record not found or failed to delete' });
  }
});

app.delete('/api/attendance', async (req, res) => {
   try {
    await prisma.attendanceDeparture.deleteMany();
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting attendance record with ID ${id}:`, error);
    res.status(404).json({ error: 'Attendance record not found or failed to delete' });
  }
})

// GET all place records
app.get('/api/places', async (req, res) => {
  try {
    const places = await prisma.place.findMany({
      include: { polygonPoints: true }, // Include polygon points for each place
    });
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});


// POST a new place record
app.post('/api/places', async (req, res) => {

  const { name, placeId, points } = req.body;
  // console.log('Received data:', points);
  // points.forEach((point) => {
  //   console.log(point);
  // });
  const pointsData = points.map(point => ({
    cordx: parseFloat(point.cordx),
    cordy: parseFloat(point.cordy)
  }));
  try {
    const newPlace = await prisma.place.create({
      data: {
        name,
        points: {
          create: pointsData
        },
      },
    });
    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Error creating place record:', error);
    res.status(500).json({ error: 'Failed to create place record' });
  }
});


// GET all points records
app.get('/api/points', async (req, res) => {
  try {
    const points = await prisma.point.findMany();
    res.json(points);
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});


// POST a new point record
app.post('/api/points', async (req, res) => {
  const { placeId,cordx, cordy } = req.body;
  try {
    const newPoint = await prisma.point.create({
      data: {
        placeId: parseInt(placeId),
        cordx: parseFloat(cordx),
        cordy: parseFloat(cordy),
      },
    });
    res.status(201).json(newPoint);
  } catch (error) {
    console.error('Error creating point record:', error);
    res.status(500).json({ error: 'Failed to create point record' });
  }
});





// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

export default app; // Export the app for testing or further use
// Export the Prisma client for use in other modules