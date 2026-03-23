import { nanoid } from "nanoid";
import { db } from "../../db/client.js";

export const adminRepo = {
  listQuizzes() {
    return db.prepare(
      "SELECT q.id, q.date, q.type, q.title, q.status, q.created_at, q.updated_at, COUNT(qu.id) AS questionCount FROM quizzes q LEFT JOIN questions qu ON qu.quiz_id = q.id GROUP BY q.id ORDER BY q.date DESC"
    ).all();
  },

  getQuizById(id: string) {
    const quiz = db.prepare("SELECT id, date, type, title, status, created_at, updated_at FROM quizzes WHERE id = ?").get(id) as
      | { id: string; date: string; type: string; title: string | null; status: string }
      | undefined;

    if (!quiz) {
      return undefined;
    }

    const questions = db.prepare(
      "SELECT id, prompt, response_type, auto_grade, correct_answer, position FROM questions WHERE quiz_id = ? ORDER BY position ASC"
    ).all(id) as Array<{
      id: string;
      prompt: string;
      response_type: string;
      auto_grade: number;
      correct_answer: string | null;
      position: number;
    }>;

    const options = db.prepare(
      "SELECT o.id, o.question_id, o.label, o.position FROM question_options o INNER JOIN questions q ON q.id = o.question_id WHERE q.quiz_id = ? ORDER BY o.position ASC"
    ).all(id) as Array<{ id: string; question_id: string; label: string; position: number }>;

    return {
      ...quiz,
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        responseType: q.response_type,
        autoGrade: Boolean(q.auto_grade),
        correctAnswer: q.correct_answer,
        position: q.position,
        options: options.filter((o) => o.question_id === q.id).map((o) => ({ id: o.id, label: o.label, position: o.position }))
      }))
    };
  },

  createQuiz(input: { date: string; type: string; title?: string; status?: string }) {
    const now = new Date().toISOString();
    const id = `quiz_${nanoid()}`;
    db.prepare("INSERT INTO quizzes (id, date, type, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id,
      input.date,
      input.type,
      input.title ?? null,
      input.status ?? "scheduled",
      now,
      now
    );
    return { id };
  },

  updateQuiz(id: string, input: { date?: string; type?: string; title?: string; status?: string }) {
    const now = new Date().toISOString();
    const current = db.prepare("SELECT id, date, type, title, status FROM quizzes WHERE id = ?").get(id) as
      | { id: string; date: string; type: string; title: string | null; status: string }
      | undefined;

    if (!current) {
      return false;
    }

    db.prepare("UPDATE quizzes SET date = ?, type = ?, title = ?, status = ?, updated_at = ? WHERE id = ?").run(
      input.date ?? current.date,
      input.type ?? current.type,
      input.title ?? current.title,
      input.status ?? current.status,
      now,
      id
    );
    return true;
  },

  deleteQuiz(id: string) {
    const result = db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);
    return result.changes > 0;
  },

  createQuestion(input: {
    quizId: string;
    prompt: string;
    responseType: string;
    autoGrade: boolean;
    correctAnswer?: string;
    position?: number;
    options?: Array<{ label: string }>;
  }): { id: string } | undefined | "duplicate" {
    const quizExists = db.prepare("SELECT id FROM quizzes WHERE id = ?").get(input.quizId) as { id: string } | undefined;
    if (!quizExists) {
      return undefined;
    }

    const duplicate = db.prepare(
      "SELECT id FROM questions WHERE quiz_id = ? AND lower(trim(prompt)) = lower(trim(?)) LIMIT 1"
    ).get(input.quizId, input.prompt) as { id: string } | undefined;

    if (duplicate) {
      return "duplicate";
    }

    const now = new Date().toISOString();
    const qId = `question_${nanoid()}`;
    const defaultPosition =
      (db.prepare("SELECT COALESCE(MAX(position), -1) AS maxPosition FROM questions WHERE quiz_id = ?").get(input.quizId) as { maxPosition: number }).maxPosition + 1;

    const transaction = db.transaction(() => {
      db.prepare(
        "INSERT INTO questions (id, quiz_id, prompt, response_type, auto_grade, correct_answer, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(qId, input.quizId, input.prompt, input.responseType, Number(input.autoGrade), input.correctAnswer ?? null, input.position ?? defaultPosition, now, now);

      if (input.options?.length) {
        const stmt = db.prepare("INSERT INTO question_options (id, question_id, label, position) VALUES (?, ?, ?, ?)");
        input.options.forEach((opt, index) => {
          stmt.run(`opt_${nanoid()}`, qId, opt.label, index);
        });
      }
    });

    transaction();
    return { id: qId };
  },

  updateQuestion(
    id: string,
    input: {
      prompt?: string;
      responseType?: string;
      autoGrade?: boolean;
      correctAnswer?: string;
      position?: number;
      options?: Array<{ label: string }>;
    }
  ): boolean | "duplicate" {
    const current = db.prepare("SELECT id, prompt, response_type, auto_grade, correct_answer, position FROM questions WHERE id = ?").get(id) as
      | { id: string; prompt: string; response_type: string; auto_grade: number; correct_answer: string | null; position: number }
      | undefined;

    if (!current) {
      return false;
    }

    const nextPrompt = input.prompt ?? current.prompt;
    const duplicate = db.prepare(
      "SELECT id FROM questions WHERE quiz_id = (SELECT quiz_id FROM questions WHERE id = ?) AND lower(trim(prompt)) = lower(trim(?)) AND id != ? LIMIT 1"
    ).get(id, nextPrompt, id) as { id: string } | undefined;

    if (duplicate) {
      return "duplicate";
    }

    const now = new Date().toISOString();
    const transaction = db.transaction(() => {
      db.prepare(
        "UPDATE questions SET prompt = ?, response_type = ?, auto_grade = ?, correct_answer = ?, position = ?, updated_at = ? WHERE id = ?"
      ).run(
        input.prompt ?? current.prompt,
        input.responseType ?? current.response_type,
        input.autoGrade === undefined ? current.auto_grade : Number(input.autoGrade),
        input.correctAnswer ?? current.correct_answer,
        input.position ?? current.position,
        now,
        id
      );

      if (input.options) {
        db.prepare("DELETE FROM question_options WHERE question_id = ?").run(id);
        const stmt = db.prepare("INSERT INTO question_options (id, question_id, label, position) VALUES (?, ?, ?, ?)");
        input.options.forEach((opt, index) => {
          stmt.run(`opt_${nanoid()}`, id, opt.label, index);
        });
      }
    });

    transaction();
    return true;
  },

  deleteQuestion(id: string) {
    const result = db.prepare("DELETE FROM questions WHERE id = ?").run(id);
    return result.changes > 0;
  },

  getLeaderboard(input: { limit: number; quizId?: string }) {
    const where = input.quizId ? "WHERE a.quiz_id = ?" : "";
    const query = `
      SELECT
        u.id AS userId,
        u.client_id AS clientId,
        u.name AS name,
        u.school AS school,
        u.school_email AS schoolEmail,
        COUNT(a.id) AS attemptsCount,
        COALESCE(SUM(a.score), 0) AS totalScore,
        COALESCE(SUM(a.total), 0) AS totalPossible,
        MAX(a.submitted_at) AS lastSubmittedAt
      FROM attempts a
      INNER JOIN users u ON u.id = a.user_id
      ${where}
      GROUP BY u.id
      ORDER BY totalScore DESC, totalPossible DESC, lastSubmittedAt ASC
      LIMIT ?
    `;

    if (input.quizId) {
      return db.prepare(query).all(input.quizId, input.limit);
    }

    return db.prepare(query).all(input.limit);
  },

  getMetrics() {
    const totals = db.prepare(
      `SELECT
        (SELECT COUNT(*) FROM quizzes) AS quizzesCount,
        (SELECT COUNT(*) FROM questions) AS questionsCount,
        (SELECT COUNT(*) FROM users) AS usersCount,
        (SELECT COUNT(*) FROM attempts) AS attemptsCount`
    ).get() as {
      quizzesCount: number;
      questionsCount: number;
      usersCount: number;
      attemptsCount: number;
    };

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const todayAttempts = db.prepare(
      `SELECT COUNT(a.id) AS count
       FROM attempts a
       INNER JOIN quizzes q ON q.id = a.quiz_id
       WHERE q.date = ?`
    ).get(today) as { count: number };

    return {
      ...totals,
      todayAttemptsCount: todayAttempts.count,
      todayDate: today
    };
  },

  listRecentAuditLogs(limit: number) {
    return db.prepare(
      `SELECT id, actor_id AS actorId, action, entity_type AS entityType, entity_id AS entityId, metadata, created_at AS createdAt
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT ?`
    ).all(limit);
  },

  logAdminAction(input: {
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    actorId?: string;
  }) {
    const actorExists = input.actorId
      ? (db.prepare("SELECT id FROM users WHERE id = ? LIMIT 1").get(input.actorId) as { id: string } | undefined)
      : undefined;

    const safeActorId = actorExists?.id ?? null;

    db.prepare(
      `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      `audit_${nanoid()}`,
      safeActorId,
      input.action,
      input.entityType,
      input.entityId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      new Date().toISOString()
    );
  }
};
