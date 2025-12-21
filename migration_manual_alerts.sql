-- Create maintenance_alerts table
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DONE')),
    due_date DATE,
    cost NUMERIC DEFAULT 0,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT auth.uid()
);

-- RLS Policies
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own alerts" ON maintenance_alerts
    FOR ALL USING (auth.uid()::text = created_by);

-- Refresh schema cache if needed
