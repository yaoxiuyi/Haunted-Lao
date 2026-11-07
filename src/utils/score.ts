/**
 * Haunted Lao — Score calculation utilities
 */

export type ScoreTier = 'low' | 'mid' | 'high'

export interface ResultCopy {
  title: string
  body: string
}

/**
 * Determine the score tier based on correct answers out of total.
 * Guards against total === 0 to avoid division by zero.
 *
 * Tiers:
 *   low  : 0 – 40%
 *   mid  : 41 – 79%
 *   high : 80 – 100%
 */
export function getScoreTier(correct: number, total: number): ScoreTier {
  if (total === 0) return 'low'
  const rate = correct / total
  if (rate <= 0.4) return 'low'
  if (rate <= 0.79) return 'mid'
  return 'high'
}

/**
 * Return Halloween-themed result copy for a given score tier.
 * All copy is in Chinese (first-version only).
 */
export function getResultCopy(tier: ScoreTier): ResultCopy {
  switch (tier) {
    case 'low':
      return {
        title: '你被鬼魂附身了…',
        body: '没关系，幽灵也是要练习的。再试一次吧！',
      }
    case 'mid':
      return {
        title: '巫师学徒，继续修炼！',
        body: '你已经掌握了一些咒语，距离大师只差一步。',
      }
    case 'high':
      return {
        title: '老挝语大法师，当之无愧！',
        body: '鬼魂都被你的流利程度吓到了。厉害！',
      }
  }
}
