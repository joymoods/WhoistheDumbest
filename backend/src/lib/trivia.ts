import axios from 'axios';
import type { Question } from '../types/models';
import he from 'he';
import { v4 as uuid } from 'uuid';

const OPEN_TRIVIA_BASE = process.env.OPEN_TRIVIA_BASE || 'https://opentdb.com';

export async function fetchQuestions(amount: number, category: string, difficulty: string, lang: string): Promise<Question[]> {
  const url = `${OPEN_TRIVIA_BASE}/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  const res = await axios.get(url);
  return res.data.results.map((q: any) => normalizeQuestion(q));
}

function normalizeQuestion(q: any): Question {
  const question: Question = {
    id: uuid(),
    type: q.type === 'boolean' ? 'boolean' : 'single',
    text: he.decode(q.question),
    options: [],
  };
  if (question.type === 'boolean') {
    question.options = [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ];
    question.correct = q.correct_answer.toLowerCase();
  } else {
    const answers = [q.correct_answer, ...q.incorrect_answers].map((a: string) => he.decode(a));
    const options = answers.map((text) => ({ id: uuid(), text }));
    question.options = options;
    if (options.length > 0) {
      question.correct = options[0]!.id;
      // match correct by value
      const correctText = he.decode(q.correct_answer);
      const correctOpt = options.find((o) => o.text === correctText);
      if (correctOpt) question.correct = correctOpt.id;
    }
  }
  return question;
}
