const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Grade = require('./models/Grade');
const Fee = require('./models/Fee');
const Notice = require('./models/Notice');
const Timetable = require('./models/Timetable');
const AuditLog = require('./models/AuditLog');
const Book = require('./models/Book');
const BookBorrow = require('./models/BookBorrow');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const PlacementDrive = require('./models/PlacementDrive');
const JobApplication = require('./models/JobApplication');
const HostelRoom = require('./models/HostelRoom');
const MaintenanceTicket = require('./models/MaintenanceTicket');
const Appointment = require('./models/Appointment');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusledger';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Grade.deleteMany({});
    await Fee.deleteMany({});
    await Notice.deleteMany({});
    await Timetable.deleteMany({});
    await AuditLog.deleteMany({});
    await Book.deleteMany({});
    await BookBorrow.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await PlacementDrive.deleteMany({});
    await JobApplication.deleteMany({});
    await HostelRoom.deleteMany({});
    await MaintenanceTicket.deleteMany({});
    await Appointment.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. Arthur Vance (Dean/Admin)',
      email: 'admin@campusledger.edu',
      password: 'Admin123!',
      role: 'admin',
      department: 'Administration',
      phone: '+1 (555) 019-2831',
    });

    // 2. Create Teachers
    const teacher1 = await User.create({
      name: 'Dr. Alok Sharma',
      email: 'dr.sharma@campusledger.edu',
      password: 'Teacher123!',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 019-3344',
    });

    const teacher2 = await User.create({
      name: 'Prof. Anita Roy',
      email: 'prof.anita@campusledger.edu',
      password: 'Teacher123!',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 019-5566',
    });

    // 3. Create Student Users & Profiles
    const studentUser1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@campusledger.edu',
      password: 'Student123!',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 019-7788',
    });

    const student1 = await Student.create({
      user: studentUser1._id,
      name: 'Alex Morgan',
      rollNumber: 'CS2026-001',
      email: 'alex.morgan@campusledger.edu',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      admissionYear: 2024,
      phone: '+1 (555) 019-7788',
      parentName: 'Robert Morgan',
      parentPhone: '+1 (555) 019-9900',
      parentEmail: 'parent.morgan@campusledger.edu',
      bloodGroup: 'O+',
      gender: 'Male',
      address: '42 Academic Avenue, Cambridge, MA',
    });
    studentUser1.profileRef = student1._id;
    await studentUser1.save();

    const studentUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@campusledger.edu',
      password: 'Student123!',
      role: 'student',
      department: 'Computer Science & Engineering',
      semester: 4,
      phone: '+1 (555) 019-1122',
    });

    const student2 = await Student.create({
      user: studentUser2._id,
      name: 'Priya Patel',
      rollNumber: 'CS2026-002',
      email: 'priya.patel@campusledger.edu',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      admissionYear: 2024,
      phone: '+1 (555) 019-1122',
      parentName: 'Robert Morgan',
      parentPhone: '+1 (555) 019-9900',
      parentEmail: 'parent.morgan@campusledger.edu',
      bloodGroup: 'B+',
      gender: 'Female',
      address: '77 Silicon Hill, Boston, MA',
    });
    studentUser2.profileRef = student2._id;
    await studentUser2.save();

    const studentUser3 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@campusledger.edu',
      password: 'Student123!',
      role: 'student',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 019-4455',
    });

    const student3 = await Student.create({
      user: studentUser3._id,
      name: 'Rahul Verma',
      rollNumber: 'CS2026-003',
      email: 'rahul.verma@campusledger.edu',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      admissionYear: 2024,
      phone: '+1 (555) 019-4455',
      parentName: 'Suresh Verma',
      parentPhone: '+1 (555) 019-4499',
      parentEmail: 'suresh.verma@gmail.com',
      bloodGroup: 'A+',
      gender: 'Male',
      address: '15 Beacon Street, Boston, MA',
    });
    studentUser3.profileRef = student3._id;
    await studentUser3.save();

    // 4. Create Parent User (linked to Alex & Priya)
    const parent = await User.create({
      name: 'Robert Morgan (Parent / Guardian)',
      email: 'parent.morgan@campusledger.edu',
      password: 'Parent123!',
      role: 'parent',
      phone: '+1 (555) 019-9900',
      linkedStudents: [student1._id, student2._id],
    });

    // 5. Seed Attendance Records
    const subjects = [
      'Database Management Systems',
      'Computer Networks',
      'Operating Systems',
      'Design & Analysis of Algorithms',
      'Artificial Intelligence',
    ];

    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      if (date.getDay() === 0) continue;

      for (const subj of subjects) {
        const alexStatus = i % 7 === 0 ? 'absent' : 'present';
        await Attendance.create({
          student: student1._id,
          subject: subj,
          date,
          status: alexStatus,
          markedBy: teacher1._id,
          department: 'Computer Science & Engineering',
          semester: 4,
          section: 'A',
        });

        const priyaStatus = i % 2 === 0 ? 'absent' : 'present';
        await Attendance.create({
          student: student2._id,
          subject: subj,
          date,
          status: priyaStatus,
          markedBy: teacher2._id,
          department: 'Computer Science & Engineering',
          semester: 4,
          section: 'A',
        });

        await Attendance.create({
          student: student3._id,
          subject: subj,
          date,
          status: 'present',
          markedBy: teacher1._id,
          department: 'Computer Science & Engineering',
          semester: 4,
          section: 'A',
        });
      }
    }

    // 6. Seed Academic Grades
    const gradesData = [
      { student: student1._id, subject: 'Database Management Systems', subjectCode: 'CS401', semester: 4, examType: 'Final', marksObtained: 92, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
      { student: student1._id, subject: 'Computer Networks', subjectCode: 'CS402', semester: 4, examType: 'Final', marksObtained: 85, maxMarks: 100, credits: 4, gradedBy: teacher2._id },
      { student: student1._id, subject: 'Operating Systems', subjectCode: 'CS403', semester: 4, examType: 'Final', marksObtained: 78, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
      { student: student1._id, subject: 'Design & Analysis of Algorithms', subjectCode: 'CS404', semester: 4, examType: 'Final', marksObtained: 88, maxMarks: 100, credits: 4, gradedBy: teacher2._id },
      { student: student1._id, subject: 'Artificial Intelligence', subjectCode: 'CS405', semester: 4, examType: 'Final', marksObtained: 95, maxMarks: 100, credits: 3, gradedBy: teacher1._id },
      { student: student2._id, subject: 'Database Management Systems', subjectCode: 'CS401', semester: 4, examType: 'Final', marksObtained: 74, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
    ];

    for (const g of gradesData) {
      await Grade.create(g);
    }

    // 7. Seed Fee Invoices
    await Fee.create({
      student: student1._id,
      title: 'Semester 4 Tuition & Lab Fee',
      category: 'Tuition',
      amount: 45000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'unpaid',
      semester: 4,
      notes: 'Includes high-performance computing lab facility charges.',
    });

    // 8. Seed Library Books Catalog
    const books = [
      {
        title: 'Database System Concepts (7th Edition)',
        author: 'Abraham Silberschatz, Henry Korth',
        isbn: '978-0078022159',
        category: 'Computer Science',
        totalCopies: 6,
        availableCopies: 5,
        shelfLocation: 'Stack CS-104',
      },
      {
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James Kurose, Keith Ross',
        isbn: '978-0133594140',
        category: 'Computer Science',
        totalCopies: 8,
        availableCopies: 8,
        shelfLocation: 'Stack CS-108',
      },
    ];
    for (const b of books) {
      await Book.create(b);
    }

    // 9. Seed Assignments LMS
    const assign1 = await Assignment.create({
      title: 'Relational Database Schema Normalization & Indexing Project',
      description: 'Design a 3NF normalized schema for a multi-tenant hospital ledger with B-Tree indexes on composite lookup queries.',
      subject: 'Database Management Systems',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxMarks: 25,
      createdBy: teacher1._id,
    });

    const assign2 = await Assignment.create({
      title: 'Socket Programming & TCP Handshake Packet Analysis',
      description: 'Implement a multi-threaded TCP chat server in Node.js or C and capture Wireshark PCAP traces.',
      subject: 'Computer Networks',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      maxMarks: 20,
      createdBy: teacher2._id,
    });

    // Seed student submission
    await Submission.create({
      assignment: assign1._id,
      student: student1._id,
      content: 'Hospital ledger schema designed with 3NF compliance, PostgreSQL scripts, and EXPLAIN ANALYZE traces.',
      fileUrl: 'https://drive.google.com/sample_alex_schema.pdf',
      status: 'submitted',
    });

    // 10. Seed Placement Recruitment Drives
    const drive1 = await PlacementDrive.create({
      companyName: 'Google LLC',
      roleTitle: 'Software Engineer - University Graduate (L3)',
      packageCTC: '$145,000 / annum',
      location: 'Mountain View, CA / Cambridge, MA (Hybrid)',
      minCGPA: 8.5,
      allowedDepartments: ['Computer Science & Engineering', 'Electronics'],
      maxBacklogs: 0,
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      jobDescription: 'Build high-scale distributed backend systems, Kubernetes orchestration pipelines, and scalable APIs.',
      status: 'active',
      postedBy: admin._id,
    });

    const drive2 = await PlacementDrive.create({
      companyName: 'Microsoft Corporation',
      roleTitle: 'Cloud Solution & Systems Architect',
      packageCTC: '$135,000 / annum',
      location: 'Redmond, WA / Boston, MA',
      minCGPA: 7.8,
      allowedDepartments: ['Computer Science & Engineering'],
      maxBacklogs: 0,
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      jobDescription: 'Design Azure multi-region cloud infrastructures and microservice architectures.',
      status: 'active',
      postedBy: admin._id,
    });

    // Seed student application
    await JobApplication.create({
      placementDrive: drive1._id,
      student: student1._id,
      appliedCGPA: 8.85,
      status: 'interviewing',
      interviewRound: 'Technical Architecture Round 2',
      feedback: 'Strong performance on distributed systems and data structures.',
    });

    // 11. Seed Hostel Rooms & Maintenance Tickets
    const room1 = await HostelRoom.create({
      hostelBlock: 'Aryabhatta Hall Block-A',
      roomNumber: '304',
      capacity: 2,
      occupiedCount: 1,
      roomType: 'AC Double',
      floor: 3,
      residents: [student1._id],
    });

    const room2 = await HostelRoom.create({
      hostelBlock: 'Aryabhatta Hall Block-A',
      roomNumber: '305',
      capacity: 2,
      occupiedCount: 1,
      roomType: 'Non-AC Double',
      floor: 3,
      residents: [student3._id],
    });

    await MaintenanceTicket.create({
      student: student1._id,
      hostelBlock: 'Aryabhatta Hall Block-A',
      roomNumber: '304',
      title: 'Study Desk Lamp Circuit Sparking',
      category: 'Electrical',
      description: 'The desk light socket is experiencing voltage fluctuations and requires socket replacement.',
      priority: 'High',
      status: 'In Progress',
      resolutionNotes: 'Electrician dispatched for evening inspection.',
    });

    // 12. Seed Parent-Teacher Consultations
    await Appointment.create({
      parent: parent._id,
      teacher: teacher1._id,
      student: student1._id,
      requestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      timeSlot: '10:30 AM - 10:45 AM',
      topic: 'Semester 4 Mid-Term Progress & Capstone Guidance',
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/cmp-ldgr-edu',
      notes: 'Consultation confirmed for Thursday morning.',
    });

    console.log('\n🎉 CampusLedger Enterprise v2.0 Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
