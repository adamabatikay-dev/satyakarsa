/**
 * SAW (Simple Additive Weighting) Algorithm
 */

export function calculateSAW(alternatives, criteriaList, userWeights) {
  // 1. Setup Data: mapping scores to alternative ID
  // alternatives = [{ id, name, scores: [{ criteriaId, value }] }]
  // criteriaList = [{ id, name, type, weight }] // type: 'benefit' | 'cost'
  // userWeights = { [criteriaId]: weightValue (1-5) }

  // 2. Normalization
  // Formula for Benefit: Normalized = Value / MaxValue
  // Formula for Cost: Normalized = MinValue / Value

  const normalizedMatrix = [];
  const minMaxMap = {};

  // Find min and max for each criteria
  criteriaList.forEach(c => {
    const scoresForC = alternatives.map(a => {
      const score = a.scores.find(s => s.criteriaId === c.id);
      return score ? score.value : 0;
    }).filter(val => val > 0);

    minMaxMap[c.id] = {
      max: scoresForC.length > 0 ? Math.max(...scoresForC) : 1,
      min: scoresForC.length > 0 ? Math.min(...scoresForC) : 1
    };
  });

  // Calculate normalized values
  alternatives.forEach(alt => {
    const normalizedRow = { alternative: alt, values: {} };
    
    criteriaList.forEach(c => {
      const scoreObj = alt.scores.find(s => s.criteriaId === c.id);
      const rawValue = scoreObj ? scoreObj.value : 0;
      let normalizedValue = 0;

      if (rawValue > 0) {
        if (c.type === 'benefit') {
          normalizedValue = rawValue / minMaxMap[c.id].max;
        } else if (c.type === 'cost') {
          normalizedValue = minMaxMap[c.id].min / rawValue;
        }
      }
      
      normalizedRow.values[c.id] = normalizedValue;
    });

    normalizedMatrix.push(normalizedRow);
  });

  // 3. Weighting (Preference Calculation)
  // Final Score = Sum of (Normalized Value * Normalized Weight)
  
  // Calculate total user weight to normalize weights
  let totalUserWeight = 0;
  criteriaList.forEach(c => {
    totalUserWeight += parseFloat(userWeights[c.id]) || c.weight || 0;
  });

  const finalResults = normalizedMatrix.map(row => {
    let totalScore = 0;
    const scoreDetails = {};
    
    criteriaList.forEach(c => {
      const rawUserWeight = parseFloat(userWeights[c.id]) || c.weight || 0;
      // Normalize weight (so they all sum up to 1.0)
      const normalizedWeight = totalUserWeight > 0 ? (rawUserWeight / totalUserWeight) : 0;
      
      const weightedValue = row.values[c.id] * normalizedWeight;
      scoreDetails[c.id] = weightedValue;
      totalScore += weightedValue;
    });

    return {
      alternativeId: row.alternative.id,
      alternativeName: row.alternative.name,
      description: row.alternative.description,
      totalScore: totalScore,
      details: scoreDetails,
      normalizedValues: row.values
    };
  });

  // 4. Ranking
  finalResults.sort((a, b) => b.totalScore - a.totalScore);

  return finalResults;
}
