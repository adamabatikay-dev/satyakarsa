import fs from 'fs';
import path from 'path';
import prisma from './prisma.js';

// 1. Authentic Baseline Data from Research & Thesis
export const BASELINE_CRITERIA = [
  { id: 1, code: 'C1', name: 'Biaya promosi murah atau bahkan gratis', type: 'cost', weight: 0.168 },
  { id: 2, code: 'C2', name: 'Produk saya dilihat banyak calon pembeli', type: 'benefit', weight: 0.166 },
  { id: 3, code: 'C3', name: 'Banyak calon pembeli yang bertanya dan berkomentar', type: 'benefit', weight: 0.115 },
  { id: 4, code: 'C4', name: 'Kelebihan produk mudah saya jelaskan', type: 'benefit', weight: 0.101 },
  { id: 5, code: 'C5', name: 'Mudah dipakai tanpa perlu keahlian khusus', type: 'benefit', weight: 0.164 },
  { id: 6, code: 'C6', name: 'Ada banyak pilihan cara promosi (foto, video, live)', type: 'benefit', weight: 0.144 },
  { id: 7, code: 'C7', name: 'Calon pembeli percaya pada produk yang dipromosikan', type: 'benefit', weight: 0.142 }
];

export const BASELINE_ALTERNATIVES = [
  { id: 1, name: 'Instagram', description: 'Platform visual dengan interaksi tinggi dan audiens luas.' },
  { id: 2, name: 'TikTok', description: 'Platform video pendek viral dengan jangkauan masif untuk audiens dinamis.' },
  { id: 3, name: 'Facebook', description: 'Jangkauan demografis terluas dengan grup komunitas dan biaya promosi efektif.' },
  { id: 4, name: 'Shopee', description: 'Marketplace e-commerce terkemuka dengan fitur promosi terintegrasi toko online.' },
  { id: 5, name: 'Tokopedia', description: 'Marketplace lokal tepercaya dengan ekosistem promosi dan pembeli loyal.' }
];

// Baseline Raw Matrix Ratings X_ij
export const BASELINE_SCORES = {
  1: { 1: 1.500, 2: 3.625, 3: 3.625, 4: 3.688, 5: 3.750, 6: 4.063, 7: 3.500 }, // Instagram
  2: { 1: 1.556, 2: 3.889, 3: 3.722, 4: 3.889, 5: 4.000, 6: 4.167, 7: 3.667 }, // TikTok
  3: { 1: 1.333, 2: 3.750, 3: 3.750, 4: 4.000, 5: 4.083, 6: 3.917, 7: 3.667 }, // Facebook
  4: { 1: 1.846, 2: 4.077, 3: 3.769, 4: 3.846, 5: 3.846, 6: 4.077, 7: 3.846 }, // Shopee
  5: { 1: 1.667, 2: 3.667, 3: 3.667, 4: 3.667, 5: 3.667, 6: 3.667, 7: 3.833 }  // Tokopedia
};

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'feedback-store.json');

// Ensure local persistence directory exists
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    const initialData = {
      settings: {
        isAutoUpdate: true,
        updateMode: 'periodic', // 'realtime' | 'periodic'
        batchThreshold: 5,      // Update every 5 new respondents
        blendingAlpha: 0.5,     // 50% baseline, 50% respondent feedback
        lastSyncedAt: new Date().toISOString()
      },
      currentMatrix: JSON.parse(JSON.stringify(BASELINE_SCORES)),
      evaluations: [
        // Seed some initial realistic respondent evaluations for immediate demo clarity
        {
          id: 1,
          respondentName: 'Budi Santoso (UMKM Kuliner)',
          alternativeId: 3, // Facebook
          scores: { 1: 1.4, 2: 3.8, 3: 3.8, 4: 4.1, 5: 4.2, 6: 4.0, 7: 3.8 },
          comment: 'Sangat efektif menjangkau komunitas lokal dan ibu-ibu rumah tangga.',
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
        },
        {
          id: 2,
          respondentName: 'Siti Rahma (Fashion Hijab)',
          alternativeId: 2, // TikTok
          scores: { 1: 1.6, 2: 4.2, 3: 4.0, 4: 4.0, 5: 3.9, 6: 4.3, 7: 3.7 },
          comment: 'Live TikTok sangat mendongkrak penjualan baju secara instan.',
          createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
        },
        {
          id: 3,
          respondentName: 'Hendra Gunawan (Elektronik)',
          alternativeId: 4, // Shopee
          scores: { 1: 1.9, 2: 4.1, 3: 3.8, 4: 3.9, 5: 3.9, 6: 4.1, 7: 4.0 },
          comment: 'Fitur flash sale dan voucher gratis ongkir sangat disukai pembeli.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ],
      syncLogs: [
        {
          id: 1,
          syncType: 'manual',
          respondentCount: 3,
          notes: 'Inisialisasi sistem dynamic feedback loop dengan parameter dasar.',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readStore() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.userFeedbacks) data.userFeedbacks = [];
    if (!data.records) data.records = [];
    return data;
  } catch (e) {
    console.error('Error reading feedback store, recreating:', e);
    ensureDataStore();
    const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    if (!data.userFeedbacks) data.userFeedbacks = [];
    if (!data.records) data.records = [];
    return data;
  }
}

function writeStore(data) {
  ensureDataStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Get Feedback Loop Settings
 */
export async function getFeedbackSettings() {
  try {
    // Try Prisma DB first
    const dbSetting = await prisma.feedbackSetting.findFirst({
      orderBy: { id: 'desc' }
    });
    if (dbSetting) return dbSetting;
  } catch (err) {
    // Database connection failed, fallback to file store
  }

  const store = readStore();
  return store.settings;
}

/**
 * Update Feedback Loop Settings
 */
export async function updateFeedbackSettings(updates) {
  const store = readStore();
  store.settings = {
    ...store.settings,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);

  try {
    const existing = await prisma.feedbackSetting.findFirst();
    if (existing) {
      await prisma.feedbackSetting.update({
        where: { id: existing.id },
        data: {
          isAutoUpdate: store.settings.isAutoUpdate,
          updateMode: store.settings.updateMode,
          batchThreshold: store.settings.batchThreshold,
          blendingAlpha: store.settings.blendingAlpha,
          lastSyncedAt: store.settings.lastSyncedAt ? new Date(store.settings.lastSyncedAt) : null
        }
      });
    } else {
      await prisma.feedbackSetting.create({
        data: {
          isAutoUpdate: store.settings.isAutoUpdate,
          updateMode: store.settings.updateMode,
          batchThreshold: store.settings.batchThreshold,
          blendingAlpha: store.settings.blendingAlpha,
          lastSyncedAt: store.settings.lastSyncedAt ? new Date(store.settings.lastSyncedAt) : null
        }
      });
    }
  } catch (err) {
    // Fail silently to local store
  }

  return store.settings;
}

/**
 * Get all Respondent Evaluations
 */
export async function getRespondentEvaluations() {
  try {
    const dbEvaluations = await prisma.respondentEvaluation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { alternative: true }
    });
    if (dbEvaluations && dbEvaluations.length > 0) {
      return dbEvaluations.map(ev => ({
        id: ev.id,
        respondentName: ev.respondentName,
        alternativeId: ev.alternativeId,
        alternativeName: ev.alternative?.name || `Platform #${ev.alternativeId}`,
        scores: typeof ev.scores === 'string' ? JSON.parse(ev.scores) : ev.scores,
        comment: ev.comment,
        createdAt: ev.createdAt
      }));
    }
  } catch (err) {
    // Fallback to store
  }

  const store = readStore();
  return store.evaluations.map(ev => {
    const alt = BASELINE_ALTERNATIVES.find(a => a.id === ev.alternativeId);
    return {
      ...ev,
      alternativeName: alt ? alt.name : `Platform #${ev.alternativeId}`
    };
  });
}

/**
 * Submit a new Respondent Evaluation & trigger feedback loop if configured
 */
export async function addRespondentEvaluation({ respondentName, alternativeId, scores, comment }) {
  const store = readStore();
  const newId = store.evaluations.length > 0 ? Math.max(...store.evaluations.map(e => e.id)) + 1 : 1;
  const newEvaluation = {
    id: newId,
    respondentName: respondentName || 'Responden Anonim',
    alternativeId: parseInt(alternativeId),
    scores: scores,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  store.evaluations.unshift(newEvaluation);
  writeStore(store);

  // Try DB insert
  try {
    await prisma.respondentEvaluation.create({
      data: {
        respondentName: newEvaluation.respondentName,
        alternativeId: newEvaluation.alternativeId,
        scores: JSON.stringify(newEvaluation.scores),
        comment: newEvaluation.comment
      }
    });
  } catch (err) {
    // Saved in store
  }

  // Check Dynamic Feedback Loop Trigger
  const settings = store.settings;
  let syncTriggered = false;
  let syncDetails = null;

  if (settings.isAutoUpdate) {
    if (settings.updateMode === 'realtime') {
      // Real-time automatic update
      syncDetails = await syncDecisionMatrix({
        syncType: 'auto_realtime',
        notes: `Pembaruan otomatis seketika setelah penilaian dari ${newEvaluation.respondentName}`
      });
      syncTriggered = true;
    } else if (settings.updateMode === 'periodic') {
      // Check periodic batch threshold
      const lastSync = new Date(settings.lastSyncedAt || 0).getTime();
      const pendingEvaluations = store.evaluations.filter(e => new Date(e.createdAt).getTime() > lastSync);
      
      if (pendingEvaluations.length >= settings.batchThreshold) {
        syncDetails = await syncDecisionMatrix({
          syncType: 'auto_periodic',
          notes: `Pembaruan berkala otomatis: Ambang batas ${settings.batchThreshold} responden baru tercapai (${pendingEvaluations.length} evaluasi masuk).`
        });
        syncTriggered = true;
      }
    }
  }

  return {
    evaluation: newEvaluation,
    syncTriggered,
    syncDetails
  };
}

/**
 * Perform Dynamic Feedback Loop Aggregation & Matrix Update
 * Formula:
 * 1. Calculate Respondent Average X_ij_resp = (sum scores) / count
 * 2. Blend with Baseline: X_ij_new = (1 - alpha) * X_ij_baseline + alpha * X_ij_resp
 */
export async function syncDecisionMatrix({ syncType = 'manual', notes = '', customAlpha = null }) {
  const store = readStore();
  const settings = store.settings;
  const alpha = customAlpha !== null ? parseFloat(customAlpha) : (parseFloat(settings.blendingAlpha) || 0.5);

  const evaluations = store.evaluations;
  const updatedMatrix = {};

  // For each alternative and criterion, compute aggregated average
  BASELINE_ALTERNATIVES.forEach(alt => {
    updatedMatrix[alt.id] = {};
    const altEvals = evaluations.filter(e => e.alternativeId === alt.id);

    BASELINE_CRITERIA.forEach(crit => {
      const baselineVal = BASELINE_SCORES[alt.id]?.[crit.id] || 3.0;
      
      if (altEvals.length > 0) {
        const sumScores = altEvals.reduce((sum, ev) => {
          const val = parseFloat(ev.scores?.[crit.id] || ev.scores?.[String(crit.id)] || baselineVal);
          return sum + val;
        }, 0);
        const respAverage = sumScores / altEvals.length;
        
        // Dynamic Blended Score
        const blendedScore = ((1 - alpha) * baselineVal) + (alpha * respAverage);
        updatedMatrix[alt.id][crit.id] = parseFloat(blendedScore.toFixed(4));
      } else {
        // No evaluations yet for this platform, retain baseline
        updatedMatrix[alt.id][crit.id] = baselineVal;
      }
    });
  });

  // Save new active matrix in store
  store.currentMatrix = updatedMatrix;
  store.settings.lastSyncedAt = new Date().toISOString();

  // Create log
  const newLog = {
    id: store.syncLogs.length > 0 ? Math.max(...store.syncLogs.map(l => l.id)) + 1 : 1,
    syncType,
    respondentCount: evaluations.length,
    notes: notes || `Matriks diperbarui (${syncType}) dengan bobot adaptasi alpha ${(alpha * 100).toFixed(0)}%.`,
    createdAt: new Date().toISOString()
  };
  store.syncLogs.unshift(newLog);
  writeStore(store);

  // Sync to PostgreSQL DB (AlternativeScore)
  try {
    const scoresOperations = [];
    for (const altIdStr of Object.keys(updatedMatrix)) {
      const altId = parseInt(altIdStr);
      for (const critIdStr of Object.keys(updatedMatrix[altId])) {
        const critId = parseInt(critIdStr);
        const val = updatedMatrix[altId][critId];
        scoresOperations.push(
          prisma.alternativeScore.upsert({
            where: {
              alternativeId_criteriaId: {
                alternativeId: altId,
                criteriaId: critId
              }
            },
            update: { value: val },
            create: { alternativeId: altId, criteriaId: critId, value: val }
          })
        );
      }
    }
    await prisma.$transaction(scoresOperations);

    // Save DB log
    await prisma.feedbackSyncLog.create({
      data: {
        syncType: newLog.syncType,
        respondentCount: newLog.respondentCount,
        notes: newLog.notes
      }
    });
  } catch (err) {
    // Database write failed, but local store is updated and active
  }

  return {
    success: true,
    syncType,
    respondentCount: evaluations.length,
    alpha,
    updatedMatrix,
    log: newLog
  };
}

/**
 * Reset Decision Matrix to Research Baseline Values
 */
export async function resetMatrixToBaseline() {
  const store = readStore();
  store.currentMatrix = JSON.parse(JSON.stringify(BASELINE_SCORES));
  store.settings.lastSyncedAt = new Date().toISOString();

  const resetLog = {
    id: store.syncLogs.length > 0 ? Math.max(...store.syncLogs.map(l => l.id)) + 1 : 1,
    syncType: 'reset',
    respondentCount: 0,
    notes: 'Matriks keputusan dikembalikan ke nilai default/baseline awal penelitian oleh Administrator.',
    createdAt: new Date().toISOString()
  };
  store.syncLogs.unshift(resetLog);
  writeStore(store);

  // Try DB reset
  try {
    const scoresOperations = [];
    for (const altIdStr of Object.keys(BASELINE_SCORES)) {
      const altId = parseInt(altIdStr);
      for (const critIdStr of Object.keys(BASELINE_SCORES[altId])) {
        const critId = parseInt(critIdStr);
        const val = BASELINE_SCORES[altId][critId];
        scoresOperations.push(
          prisma.alternativeScore.upsert({
            where: {
              alternativeId_criteriaId: {
                alternativeId: altId,
                criteriaId: critId
              }
            },
            update: { value: val },
            create: { alternativeId: altId, criteriaId: critId, value: val }
          })
        );
      }
    }
    await prisma.$transaction(scoresOperations);

    await prisma.feedbackSyncLog.create({
      data: {
        syncType: 'reset',
        respondentCount: 0,
        notes: resetLog.notes
      }
    });
  } catch (err) {
    // Local store is reset
  }

  return { success: true, message: 'Matriks berhasil dikembalikan ke nilai baseline' };
}

/**
 * Get Matrix Comparison (Baseline vs Respondent Averages vs Active Matrix)
 */
export async function getMatrixComparison() {
  const store = readStore();
  const evaluations = store.evaluations;
  const currentMatrix = store.currentMatrix || BASELINE_SCORES;
  const settings = store.settings;

  const comparison = BASELINE_ALTERNATIVES.map(alt => {
    const altEvals = evaluations.filter(e => e.alternativeId === alt.id);
    const criteriaDetails = {};

    BASELINE_CRITERIA.forEach(crit => {
      const baselineVal = BASELINE_SCORES[alt.id]?.[crit.id] || 0;
      let respAverage = null;
      let respCount = altEvals.length;

      if (altEvals.length > 0) {
        const sum = altEvals.reduce((acc, ev) => {
          return acc + parseFloat(ev.scores?.[crit.id] || ev.scores?.[String(crit.id)] || baselineVal);
        }, 0);
        respAverage = parseFloat((sum / altEvals.length).toFixed(4));
      }

      const activeVal = parseFloat((currentMatrix[alt.id]?.[crit.id] ?? baselineVal).toFixed(4));
      const delta = parseFloat((activeVal - baselineVal).toFixed(4));

      criteriaDetails[crit.id] = {
        code: crit.code,
        name: crit.name,
        type: crit.type,
        baselineVal,
        respAverage: respAverage !== null ? respAverage : baselineVal,
        respCount,
        activeVal,
        delta
      };
    });

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      description: alt.description,
      evaluationCount: altEvals.length,
      criteria: criteriaDetails
    };
  });

  return {
    settings,
    totalEvaluations: evaluations.length,
    comparison,
    criteriaList: BASELINE_CRITERIA,
    alternativesList: BASELINE_ALTERNATIVES,
    syncLogs: store.syncLogs
  };
}

/**
 * Get Current Active Matrix Scores for SAW Calculation
 */
export async function getActiveMatrixForCalculation() {
  try {
    const alts = await prisma.alternative.findMany({
      include: { scores: true }
    });
    if (alts && alts.length > 0 && alts[0].scores && alts[0].scores.length > 0) {
      return alts;
    }
  } catch (e) {
    // Fallback to store
  }

  const store = readStore();
  const currentMatrix = store.currentMatrix || BASELINE_SCORES;

  return BASELINE_ALTERNATIVES.map(alt => ({
    id: alt.id,
    name: alt.name,
    description: alt.description,
    scores: BASELINE_CRITERIA.map(crit => ({
      alternativeId: alt.id,
      criteriaId: crit.id,
      value: currentMatrix[alt.id]?.[crit.id] ?? BASELINE_SCORES[alt.id]?.[crit.id] ?? 3.0
    }))
  }));
}

/**
 * User Feedback (Saran & Kritik)
 */
export async function getUserFeedbackList() {
  try {
    const feedbackList = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (feedbackList && feedbackList.length > 0) {
      return feedbackList;
    }
  } catch (err) {
    // Database connection failed, fallback to store
  }

  const store = readStore();
  return store.userFeedbacks || [];
}

export async function addUserFeedback({ name, message }) {
  const store = readStore();
  if (!store.userFeedbacks) store.userFeedbacks = [];

  const newId = store.userFeedbacks.length > 0
    ? Math.max(...store.userFeedbacks.map(f => f.id || 0)) + 1
    : 1;

  const newFeedback = {
    id: newId,
    name: name || 'Anonim',
    message: message,
    createdAt: new Date().toISOString()
  };

  store.userFeedbacks.unshift(newFeedback);
  writeStore(store);

  // Attempt database write in background if available
  try {
    const dbFb = await prisma.feedback.create({
      data: { name: newFeedback.name, message: newFeedback.message }
    });
    return dbFb;
  } catch (err) {
    // Local store is saved and returned
    return newFeedback;
  }
}

/**
 * Recommendation Records (Riwayat Rekomendasi)
 */
export async function getRecommendationRecords() {
  try {
    const records = await prisma.recommendationRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (records && records.length > 0) {
      return records;
    }
  } catch (err) {
    // Fallback to store
  }

  const store = readStore();
  return store.records || [];
}

export async function addRecommendationRecord({ identityData, topAlternativeId, topAlternativeName, score }) {
  const store = readStore();
  if (!store.records) store.records = [];

  const newId = store.records.length > 0
    ? Math.max(...store.records.map(r => r.id || 0)) + 1
    : 1;

  const newRecord = {
    id: newId,
    identityData: typeof identityData === 'string' ? identityData : JSON.stringify(identityData),
    topAlternativeId: parseInt(topAlternativeId),
    topAlternativeName: topAlternativeName,
    score: parseFloat(score),
    createdAt: new Date().toISOString()
  };

  store.records.unshift(newRecord);
  writeStore(store);

  try {
    const dbRecord = await prisma.recommendationRecord.create({
      data: {
        identityData: newRecord.identityData,
        topAlternativeId: newRecord.topAlternativeId,
        topAlternativeName: newRecord.topAlternativeName,
        score: newRecord.score
      }
    });
    return dbRecord;
  } catch (err) {
    return newRecord;
  }
}

/**
 * Save manual scores from Admin Penilaian
 */
export async function saveManualAlternativeScores(scores) {
  const store = readStore();
  if (!store.currentMatrix) {
    store.currentMatrix = JSON.parse(JSON.stringify(BASELINE_SCORES));
  }

  scores.forEach(s => {
    const altId = parseInt(s.alternativeId);
    const critId = parseInt(s.criteriaId);
    if (!store.currentMatrix[altId]) store.currentMatrix[altId] = {};
    store.currentMatrix[altId][critId] = parseFloat(s.value) || 0;
  });

  writeStore(store);

  try {
    const operations = scores.map(score => {
      return prisma.alternativeScore.upsert({
        where: {
          alternativeId_criteriaId: {
            alternativeId: parseInt(score.alternativeId),
            criteriaId: parseInt(score.criteriaId)
          }
        },
        update: { value: parseFloat(score.value) || 0 },
        create: {
          alternativeId: parseInt(score.alternativeId),
          criteriaId: parseInt(score.criteriaId),
          value: parseFloat(score.value) || 0
        }
      });
    });
    await prisma.$transaction(operations);
  } catch (err) {
    // Local store is saved
  }

  return { success: true };
}

