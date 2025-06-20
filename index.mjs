import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';



import { withAccelerate } from '@prisma/extension-accelerate'






// Initialize Prisma and Express
const prisma = new PrismaClient().$extends(withAccelerate())
const app = express();
const port = process.env.PORT || 8080 ||3001;

// Middleware
app.use(cors({
   origin: [
    'https://tamamy.vercel.app' // For local development
  ], // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Employee Endpoints
app.route('/employees')
  .get(async (req, res) => {
    try {
      const employees = await prisma.employee.findMany({
        include: { attendanceDepartures: true },
      });
      res.json(employees);
    } catch (error) {
      handleServerError(res, 'Error fetching employees', error);
    }
  })
  .post(validateEmployeeData, async (req, res) => {
    try {
      const { employeeName, employeeCode, hireDate, department, jobTitle } = req.body;
      const newEmployee = await prisma.employee.create({
        data: { employeeName, employeeCode, hireDate: hireDate ? new Date(hireDate) : null, department, jobTitle },
      });
      res.status(201).json(newEmployee);
    } catch (error) {
      handleServerError(res, 'Error creating employee', error);
    }
  });

app.route('/employees/:id')
  .get(async (req, res) => {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { attendanceDepartures: true },
      });
      employee ? res.json(employee) : res.status(404).json({ error: 'Employee not found' });
    } catch (error) {
      handleServerError(res, `Error fetching employee with ID ${req.params.id}`, error);
    }
  })
  .put(async (req, res) => {
    try {
      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
      });
      res.json(updatedEmployee);
    } catch (error) {
      handleServerError(res, `Error updating employee with ID ${req.params.id}`, error);
    }
  })
  .delete(async (req, res) => {
    try {
      await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
      res.status(204).send();
    } catch (error) {
      handleServerError(res, `Error deleting employee with ID ${req.params.id}`, error);
    }
  });

// Attendance Endpoints
app.route('/attendance')
  .get(async (req, res) => {
    try {
      const records = await prisma.attendanceDeparture.findMany({
        include: { employee: true },
      });
      res.json(records);
    } catch (error) {
      handleServerError(res, 'Error fetching attendance records', error);
    }
  })
  .post(validateAttendanceData, async (req, res) => {
    try {
      const { employeeId, cordx, cordy } = req.body;
      const newRecord = await prisma.attendanceDeparture.create({
        data: { employeeId: parseInt(employeeId), cordx: parseFloat(cordx), cordy: parseFloat(cordy) },
      });
      res.status(201).json(newRecord);
    } catch (error) {
      if (error.code === 'P2003') {
        res.status(400).json({ error: 'Employee not found' });
      } else {
        handleServerError(res, 'Error creating attendance record', error);
      }
    }
  })
  .delete(async (req, res) => {
    try {
      await prisma.attendanceDeparture.deleteMany();
      res.status(204).send();
    } catch (error) {
      handleServerError(res, 'Error deleting attendance records', error);
    }
  });

// Places Endpoints
app.route('/places')
  .get(async (req, res) => {
    try {
      const places = await prisma.place.findMany({ include: { points: true } });
      res.json(places);
    } catch (error) {
      handleServerError(res, 'Error fetching places', error);
    }
  })
  .post(validatePlaceData, async (req, res) => {
    try {
      const { name, points } = req.body;
      const newPlace = await prisma.place.create({
        data: {
          name,
          points: { create: points.map(p => ({ cordx: parseFloat(p.cordx), cordy: parseFloat(p.cordy) })) },
        },
      });
      res.status(201).json(newPlace);
    } catch (error) {
      handleServerError(res, 'Error creating place', error);
    }
  });

// Helper Middleware
function validateEmployeeData(req, res, next) {
  const { employeeName, employeeCode } = req.body;
  if (!employeeName?.trim() || !employeeCode?.trim()) {
    return res.status(400).json({ error: 'Employee name and code are required' });
  }
  next();
}

function validateAttendanceData(req, res, next) {
  const { employeeId, cordx, cordy } = req.body;
  if ([employeeId, cordx, cordy].some(val => val === undefined || isNaN(val))) {
    return res.status(400).json({ error: 'Missing or invalid employeeId, cordx, or cordy' });
  }
  next();
}

function validatePlaceData(req, res, next) {
  const { name, points } = req.body;
  if (!name?.trim() || !Array.isArray(points) || points.length < 3) {
    return res.status(400).json({ error: 'Place name and at least 3 points are required' });
  }
  next();
}

function handleServerError(res, message, error) {
  console.error(message, error);
  res.status(500).json({ error: message });
}

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    prisma.$disconnect();
    console.log('Server stopped');
  });
});

export { app, prisma };
