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

      { student: student1._id, subject: 'Data Structures', subjectCode: 'CS301', semester: 3, examType: 'Final', marksObtained: 89, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
      { student: student1._id, subject: 'Discrete Mathematics', subjectCode: 'CS302', semester: 3, examType: 'Final', marksObtained: 82, maxMarks: 100, credits: 4, gradedBy: teacher2._id },
      { student: student1._id, subject: 'Digital Logic', subjectCode: 'CS303', semester: 3, examType: 'Final', marksObtained: 91, maxMarks: 100, credits: 3, gradedBy: teacher1._id },

      { student: student2._id, subject: 'Database Management Systems', subjectCode: 'CS401', semester: 4, examType: 'Final', marksObtained: 74, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
      { student: student2._id, subject: 'Computer Networks', subjectCode: 'CS402', semester: 4, examType: 'Final', marksObtained: 68, maxMarks: 100, credits: 4, gradedBy: teacher2._id },
      { student: student2._id, subject: 'Operating Systems', subjectCode: 'CS403', semester: 4, examType: 'Final', marksObtained: 80, maxMarks: 100, credits: 4, gradedBy: teacher1._id },
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

    await Fee.create({
      student: student1._id,
      title: 'Mid-Term Examination & Assessment Fee',
      category: 'Examination',
      amount: 3500,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'paid',
      paidAmount: 3500,
      semester: 4,
      paymentDetails: {
        razorpayOrderId: 'order_test_987654321',
        razorpayPaymentId: 'pay_test_123456789',
        razorpaySignature: 'sig_test_verified',
        paidAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        receiptNumber: 'CLR-2026-904123',
        paymentMethod: 'Online Razorpay / Card',
      },
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
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles Leiserson',
        isbn: '978-0262033848',
        category: 'Computer Science',
        totalCopies: 5,
        availableCopies: 4,
        shelfLocation: 'Stack CS-112',
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        isbn: '978-0136042594',
        category: 'Computer Science',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Stack AI-201',
      },
    ];

    for (const b of books) {
      await Book.create(b);
    }

    // Seed Notices
    await Notice.create({
      title: 'Mid-Semester Examinations Schedule Released',
      body: 'The Spring 2026 Mid-Semester Examination schedule has been officially published. All students are advised to check their exam hall allocations and timetable.',
      postedBy: admin._id,
      audience: 'all',
      priority: 'urgent',
      isPinned: true,
    });

    console.log('\n🎉 CampusLedger Enhanced Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
