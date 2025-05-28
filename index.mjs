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

// Employee Endpoints

// GET all employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET a single employee by ID
app.get('/employees/:id', async (req, res) => {
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
app.post('/employees', async (req, res) => {
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
app.put('/employees/:id', async (req, res) => {
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
app.delete('/employees/:id', async (req, res) => {
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
app.get('/attendance', async (req, res) => {
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
app.get('/employees/:employeeId/attendance', async (req, res) => {
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
app.post('/attendance', async (req, res) => {

  const { cordx, cordy, employeeId } = req.body;

  try {
   if (employeeId){
    const newAttendance = await prisma.attendanceDeparture.create({
      data: {
        employeeId: parseInt(employeeId),
        cordx: parseFloat(cordx),
        cordy:parseFloat(cordy),
      },
    });
    res.status(201).json(newAttendance);
  
   } else {
    return
   }
    
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// PUT (update) an existing attendance/departure record by ID
app.put('/attendance/:id', async (req, res) => {
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
app.delete('/attendance/:id', async (req, res) => {
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

app.delete(`/attendance`, async (req, res) => {
   try {
    await prisma.attendanceDeparture.deleteMany();
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting attendance record with ID ${id}:`, error);
    res.status(404).json({ error: 'Attendance record not found or failed to delete' });
  }
})

// GET all place records
app.get('/places', async (req, res) => {
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
app.post('/places', async (req, res) => {

  const { name, placeId, polygonPoints } = req.body;
  // console.log('Received data:', polygonPoints);
  // polygonPoints.forEach((point) => {
  //   console.log(point);
  // });
  const pointsData = req.body.polygonPoints.map(point => ({
  cordx: parseFloat(point.cordx),
  cordy: parseFloat(point.cordy)
}));
  try {
    const newPlace = await prisma.place.create({
      data: {
        name,
        polygonPoints: {
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
app.get('/points', async (req, res) => {
  try {
    const points = await prisma.point.findMany();
    res.json(points);
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});


// POST a new point record
app.post('/points', async (req, res) => {
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





// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});