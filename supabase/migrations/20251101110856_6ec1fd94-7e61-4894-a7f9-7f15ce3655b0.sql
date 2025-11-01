-- Create states table
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create districts table with geolocation
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  state_id UUID REFERENCES public.states(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monthly performance data table
CREATE TABLE IF NOT EXISTS public.monthly_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  
  -- Key MGNREGA metrics
  total_beneficiaries INTEGER DEFAULT 0,
  person_days_generated INTEGER DEFAULT 0,
  average_wage_per_day DECIMAL(10, 2) DEFAULT 0,
  total_wage_outlay DECIMAL(15, 2) DEFAULT 0,
  payments_released DECIMAL(15, 2) DEFAULT 0,
  payment_completion_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Work completion metrics
  total_works_completed INTEGER DEFAULT 0,
  total_works_ongoing INTEGER DEFAULT 0,
  
  -- Additional metrics
  women_beneficiaries INTEGER DEFAULT 0,
  sc_beneficiaries INTEGER DEFAULT 0,
  st_beneficiaries INTEGER DEFAULT 0,
  
  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  data_source TEXT DEFAULT 'data.gov.in',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per district per month/year
  UNIQUE(district_id, month, year)
);

-- Create index for faster queries
CREATE INDEX idx_monthly_performance_district ON public.monthly_performance(district_id);
CREATE INDEX idx_monthly_performance_date ON public.monthly_performance(year DESC, month DESC);
CREATE INDEX idx_districts_state ON public.districts(state_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is public welfare data)
CREATE POLICY "Allow public read access to states"
  ON public.states FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to districts"
  ON public.districts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to monthly performance"
  ON public.monthly_performance FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_performance_updated_at
  BEFORE UPDATE ON public.monthly_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample state (Uttar Pradesh - largest state for demo)
INSERT INTO public.states (name, code) 
VALUES ('Uttar Pradesh', 'UP')
ON CONFLICT (code) DO NOTHING;