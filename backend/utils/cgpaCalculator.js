/**
 * CGPA and GPA computation engine
 * Uses standard 10-point academic scale with weighted credit points
 */

const calculateGradePoint = (marksObtained, maxMarks = 100) => {
  const percentage = (marksObtained / maxMarks) * 100;
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 4;
  return 0; // Fail
};

const getGradeLetter = (marksObtained, maxMarks = 100) => {
  const percentage = (marksObtained / maxMarks) * 100;
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'P';
  return 'F';
};

const calculateSemesterGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  grades.forEach((grade) => {
    const credits = Number(grade.credits) || 3;
    const gradePoint = grade.gradePoint !== undefined 
      ? Number(grade.gradePoint) 
      : calculateGradePoint(grade.marksObtained, grade.maxMarks);

    totalCredits += credits;
    totalWeightedPoints += gradePoint * credits;
  });

  if (totalCredits === 0) return 0;
  return parseFloat((totalWeightedPoints / totalCredits).toFixed(2));
};

const calculateCumulativeCGPA = (allGrades) => {
  if (!allGrades || allGrades.length === 0) return 0;

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  allGrades.forEach((grade) => {
    const credits = Number(grade.credits) || 3;
    const gradePoint = grade.gradePoint !== undefined 
      ? Number(grade.gradePoint) 
      : calculateGradePoint(grade.marksObtained, grade.maxMarks);

    totalCredits += credits;
    totalWeightedPoints += gradePoint * credits;
  });

  if (totalCredits === 0) return 0;
  return parseFloat((totalWeightedPoints / totalCredits).toFixed(2));
};

module.exports = {
  calculateGradePoint,
  getGradeLetter,
  calculateSemesterGPA,
  calculateCumulativeCGPA,
};
