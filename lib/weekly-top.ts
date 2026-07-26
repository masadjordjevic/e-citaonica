// Štreberka nedelje - Weekly top studier system

import type { Member } from "@/lib/members"

/**
 * Calculate which member studied the most hours this week.
 * Ties are broken by who reached the top time first (based on ID order).
 */
export function getWeeklyTopMember(members: Member[]): Member | null {
  if (members.length === 0) return null

  let topMember = members[0]
  for (const member of members.slice(1)) {
    if (member.hoursThisWeek > topMember.hoursThisWeek) {
      topMember = member
    }
  }

  // Only award if they actually studied (hours > 0)
  return topMember.hoursThisWeek > 0 ? topMember : null
}

/**
 * Mark a member as the weekly top studier.
 * Returns updated members array with isWeeklyTop flag set correctly.
 */
export function updateWeeklyTopBadge(members: Member[]): Member[] {
  const topMember = getWeeklyTopMember(members)
  return members.map((m) => ({
    ...m,
    isWeeklyTop: m.id === topMember?.id,
  }))
}
