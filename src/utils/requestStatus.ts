/** What each request status means for the citizen who submitted it. */
export const TRACK_STATUS_TEXT: Record<string, string> = {
  Pending: 'Received. A district coordinator will review it shortly.',
  Verified: 'Verified by a coordinator. A response team is being arranged.',
  Assigned: 'A volunteer task has been created. Waiting for a volunteer to accept it.',
  'In Progress': 'A volunteer is on the way / working on your request.',
  Resolved: 'Marked as resolved. If you still need help, submit a new request or call 999.'
};
