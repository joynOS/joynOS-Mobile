import { UserAction } from '../types/api';

/**
 * Helper functions for working with userActions array from the new API format
 */

export const hasUserLiked = (userActions?: UserAction[]): boolean => {
  return userActions?.some(action => action.actionType === 'LIKED') || false;
};

export const hasUserSaved = (userActions?: UserAction[]): boolean => {
  return userActions?.some(action => action.actionType === 'SAVED') || false;
};

/**
 * Backward compatibility - checks both new userActions and legacy flags
 */
export const isEventLiked = (event: { userActions?: UserAction[]; isLiked?: boolean }): boolean => {
  // New format takes precedence
  if (event.userActions) {
    return hasUserLiked(event.userActions);
  }
  // Fallback to legacy flag
  return event.isLiked || false;
};

export const isEventSaved = (event: { userActions?: UserAction[]; isSaved?: boolean }): boolean => {
  // New format takes precedence
  if (event.userActions) {
    return hasUserSaved(event.userActions);
  }
  // Fallback to legacy flag
  return event.isSaved || false;
};