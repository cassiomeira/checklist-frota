-- Migration: Create corrective_actions table
-- Purpose: Track corrective actions taken on checklist items with problems

CREATE TABLE IF NOT EXISTS corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    corrected_by TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id)
);

CREATE INDEX IF NOT EXISTS idx_corrective_actions_checklist ON corrective_actions(checklist_id);

COMMENT ON TABLE corrective_actions IS 'Tracks corrective actions taken on checklist items that had problems';
COMMENT ON COLUMN corrective_actions.item_id IS 'ID of the checklist item that was corrected';
COMMENT ON COLUMN corrective_actions.action_taken IS 'Description of what was done to fix the problem';
COMMENT ON COLUMN corrective_actions.verified IS 'Whether the correction has been verified/inspected';
