const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

/**
 * Parse an uploaded CSV or Excel buffer into structured student rows
 */
const parseStudentFile = (buffer, filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  let records = [];

  if (ext === 'csv') {
    const csvContent = buffer.toString('utf-8');
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } else if (ext === 'xlsx' || ext === 'xls') {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    records = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  } else {
    throw new Error('Unsupported file extension. Please upload .csv or .xlsx');
  }

  // Normalize field names
  return records.map((row) => {
    return {
      name: row.name || row.Name || row['Student Name'] || '',
      email: (row.email || row.Email || row['Student Email'] || '').toLowerCase().trim(),
      rollNumber: (row.rollNumber || row.RollNumber || row['Roll No'] || row['Roll Number'] || '').toUpperCase().trim(),
      department: row.department || row.Department || row.Dept || 'Computer Science & Engineering',
      semester: parseInt(row.semester || row.Semester || row.Sem || '1', 10),
      section: (row.section || row.Section || row.Sec || 'A').toUpperCase().trim(),
      phone: row.phone || row.Phone || row['Phone Number'] || '',
      parentName: row.parentName || row['Parent Name'] || row.Guardian || '',
      parentPhone: row.parentPhone || row['Parent Phone'] || '',
      parentEmail: (row.parentEmail || row['Parent Email'] || '').toLowerCase().trim(),
      gender: row.gender || row.Gender || 'Male',
      bloodGroup: row.bloodGroup || row['Blood Group'] || 'O+',
    };
  });
};

module.exports = { parseStudentFile };
