// Quick test of script generator
import { generateScript } from './src/utils/scriptGenerator.ts';

const testQuestion = {
  examName: 'IIT JAM',
  courseName: 'Mathematics',
  questionStatement: 'What is the value of lim(x→0) (sin(x)/x)?',
  questionType: 'mcq',
  options: '{"A": "0", "B": "1", "C": "∞", "D": "Does not exist"}',
  answer: 'B',
  solution: 'Using L\'Hospital\'s rule or the standard limit, lim(x→0) (sin(x)/x) = 1'
};

try {
  const script = generateScript(
    testQuestion.examName,
    testQuestion.courseName,
    testQuestion.questionStatement,
    testQuestion.questionType,
    testQuestion.options,
    testQuestion.answer,
    testQuestion.solution
  );

  console.log('=== GENERATED SCRIPT ===');
  console.log(script);
  console.log('========================');
  console.log('\nScript length:', script.length);
  console.log('Success! ✓');
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
