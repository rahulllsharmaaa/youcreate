interface ScriptTemplate {
  id: number;
  name: string;
  introPattern: string;
  questionPattern: string;
  timerPattern: string;
  answerRevealPattern: string;
  solutionPattern: string;
  outroPattern: string;
}

const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 1,
    name: 'Engaging Teacher Style',
    introPattern: 'Hey everyone! Today we are solving a question from {exam_name} for {course_name}.',
    questionPattern: 'So the question says: {question_statement}. {options_text}',
    timerPattern: 'I want you to try this yourself. Take 5 seconds. Ready? 5... 4... 3... 2... 1...',
    answerRevealPattern: 'Okay, time is up! The answer and solution are on your screen.',
    solutionPattern: '',
    outroPattern: 'If you want a complete roadmap for {exam_name} {course_name}, follow and comment "roadmap" and it will be in your DMs.'
  },
  {
    id: 2,
    name: 'Direct and Clear Style',
    introPattern: 'Hello! Quick question for {exam_name} {course_name} today.',
    questionPattern: 'The question is: {question_statement}. {options_text}',
    timerPattern: 'Try it yourself! You have 5 seconds. 5... 4... 3... 2... 1... Done!',
    answerRevealPattern: 'Time up! Here is the answer on your screen.',
    solutionPattern: '',
    outroPattern: 'For complete {exam_name} {course_name} preparation guide, follow and comment "guide". Check your DMs!'
  },
  {
    id: 3,
    name: 'Motivational Style',
    introPattern: 'What is up! Ready for a {exam_name} {course_name} challenge today?',
    questionPattern: 'Here is the question: {question_statement}. {options_text}',
    timerPattern: 'Think you can solve it? Let me see! 5 seconds starting now... 5... 4... 3... 2... 1... Let us check!',
    answerRevealPattern: 'And the answer is revealed on your screen!',
    solutionPattern: '',
    outroPattern: 'Want to master {exam_name} {course_name}? Follow me and drop "roadmap" for the complete preparation guide in your DMs!'
  },
  {
    id: 4,
    name: 'Professional Academic Style',
    introPattern: 'Welcome. Today we will solve a question from {exam_name} for {course_name}.',
    questionPattern: 'The question states: {question_statement}. {options_text}',
    timerPattern: 'Attempt this problem independently. 5 seconds. 5... 4... 3... 2... 1... Proceed.',
    answerRevealPattern: 'The correct answer is now displayed on screen.',
    solutionPattern: '',
    outroPattern: 'For comprehensive {exam_name} {course_name} preparation resources, follow and comment "roadmap".'
  },
  {
    id: 5,
    name: 'Friendly Tutor Style',
    introPattern: 'Hey there! Got an interesting {exam_name} {course_name} question for you today.',
    questionPattern: 'Let us read it: {question_statement}. {options_text}',
    timerPattern: 'Give it a shot! I will wait 5 seconds. 5... 4... 3... 2... 1... Okay!',
    answerRevealPattern: 'Here is the answer on your screen!',
    solutionPattern: '',
    outroPattern: 'Need more practice with {exam_name} {course_name}? Hit follow and comment "roadmap" for the complete guide!'
  }
];

function convertMathExpressionToSpeech(text: string): string {
  let result = text;
  
  // Handle fractions like 1/2 -> "1 by 2" or "one-half"
  result = result.replace(/(\d+)\/(\d+)/g, (match, num, den) => {
    if (num === '1' && den === '2') return 'one-half';
    if (num === '1' && den === '3') return 'one-third';
    if (num === '1' && den === '4') return 'one-fourth';
    if (num === '2' && den === '3') return 'two-thirds';
    if (num === '3' && den === '4') return 'three-fourths';
    return `${num} by ${den}`;
  });
  
  // Handle matrix notation like [1,2;3,4] -> "a matrix with elements..."
  result = result.replace(/\[([^\]]+)\]/g, (match, content) => {
    if (content.includes(';') || content.includes(',')) {
      const rows = content.split(';');
      if (rows.length > 1) {
        const rowCount = rows.length;
        const colCount = rows[0].split(',').length;
        return `a matrix of ${rowCount} by ${colCount} with elements ${content.replace(/;/g, ' next row ').replace(/,/g, ' and ')}`;
      }
    }
    return match;
  });
  
  // Handle powers like x^2 -> "x squared" or "x raised to power 2"
  result = result.replace(/(\w)\^2/g, '$1 squared');
  result = result.replace(/(\w)\^3/g, '$1 cubed');
  result = result.replace(/(\w)\^(\d+)/g, '$1 raised to power $2');
  
  // Handle common math symbols
  result = result.replace(/\*/g, ' times ');
  result = result.replace(/÷/g, ' divided by ');
  result = result.replace(/=/g, ' equals ');
  result = result.replace(/≠/g, ' not equals ');
  result = result.replace(/≤/g, ' less than or equal to ');
  result = result.replace(/≥/g, ' greater than or equal to ');
  result = result.replace(/</g, ' less than ');
  result = result.replace(/>/g, ' greater than ');
  result = result.replace(/√/g, ' square root of ');
  result = result.replace(/∞/g, ' infinity ');
  result = result.replace(/π/g, ' pi ');
  result = result.replace(/∑/g, ' sum of ');
  result = result.replace(/∫/g, ' integral of ');
  
  // Remove LaTeX-style commands
  result = result.replace(/\\[a-z]+\{([^}]+)\}/g, '$1');
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function formatOptions(options: string, questionType: string): string {
  if (!options || !['mcq', 'msq'].includes(questionType.toLowerCase())) {
    return '';
  }
  
  try {
    const optionObj = JSON.parse(options);
    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const optionTexts: string[] = [];
    
    optionLetters.forEach((letter) => {
      if (optionObj[letter]) {
        const cleanOption = convertMathExpressionToSpeech(optionObj[letter]);
        optionTexts.push(`Option ${letter}: ${cleanOption}`);
      }
    });
    
    if (optionTexts.length > 0) {
      return 'The options are: ' + optionTexts.join('. ') + '.';
    }
  } catch (e) {
    console.error('Error parsing options:', e);
  }
  
  return '';
}

export function generateScript(
  examName: string,
  courseName: string,
  questionStatement: string,
  questionType: string,
  options: string | null,
  answer: string,
  solution: string | null,
  templateId?: number
): string {
  // Select random template if not specified
  const selectedTemplate = templateId 
    ? SCRIPT_TEMPLATES.find(t => t.id === templateId) || SCRIPT_TEMPLATES[0]
    : SCRIPT_TEMPLATES[Math.floor(Math.random() * SCRIPT_TEMPLATES.length)];
  
  // Convert question and answer to natural speech
  const questionSpeech = convertMathExpressionToSpeech(questionStatement);
  const answerSpeech = convertMathExpressionToSpeech(answer);
  const optionsText = formatOptions(options || '', questionType);
  
  // Build script from template
  let script = '';
  
  // Introduction
  script += selectedTemplate.introPattern
    .replace('{exam_name}', examName)
    .replace('{course_name}', courseName);
  script += ' ';
  
  // Question
  script += selectedTemplate.questionPattern
    .replace('{question_statement}', questionSpeech)
    .replace('{options_text}', optionsText);
  script += ' ';
  
  // Timer/Pause
  script += selectedTemplate.timerPattern;
  script += ' ';
  
  // Answer reveal
  script += selectedTemplate.answerRevealPattern;
  script += ' ';
  
  // Outro/CTA
  script += selectedTemplate.outroPattern
    .replace('{exam_name}', examName)
    .replace('{course_name}', courseName);
  
  return script.trim();
}

export function getRandomTemplate(): ScriptTemplate {
  return SCRIPT_TEMPLATES[Math.floor(Math.random() * SCRIPT_TEMPLATES.length)];
}

export { SCRIPT_TEMPLATES };
