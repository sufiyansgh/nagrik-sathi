import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, IndianRupee, Briefcase, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PerformanceChart from "@/components/PerformanceChart";
import MetricCard from "@/components/MetricCard";

interface District {
  id: string;
  name: string;
  code: string;
}

interface PerformanceData {
  id: string;
  month: number;
  year: number;
  total_beneficiaries: number;
  person_days_generated: number;
  average_wage_per_day: number;
  total_wage_outlay: number;
  payments_released: number;
  payment_completion_percentage: number;
  total_works_completed: number;
  total_works_ongoing: number;
  women_beneficiaries: number;
}

const monthNames = [
  "जनवरी/Jan", "फरवरी/Feb", "मार्च/Mar", "अप्रैल/Apr", "मई/May", "जून/Jun",
  "जुलाई/Jul", "अगस्त/Aug", "सितंबर/Sep", "अक्टूबर/Oct", "नवंबर/Nov", "दिसंबर/Dec"
];

const Dashboard = () => {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentData, setCurrentData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (districtId) {
      fetchDistrictData();
      fetchPerformanceData();
    }
  }, [districtId]);

  const fetchDistrictData = async () => {
    try {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, code")
        .eq("id", districtId)
        .single();

      if (error) throw error;
      setDistrict(data);
    } catch (error) {
      console.error("Error fetching district:", error);
      toast.error("जिला लोड करने में त्रुटि / Error loading district");
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const { data, error } = await supabase
        .from("monthly_performance")
        .select("*")
        .eq("district_id", districtId)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPerformanceData(data);
        setCurrentData(data[0]); // Most recent data
      } else {
        toast.info("इस जिले के लिए कोई डेटा उपलब्ध नहीं है / No data available for this district");
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("प्रदर्शन डेटा लोड करने में त्रुटि / Error loading performance data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getPerformanceStatus = (percentage: number) => {
    if (percentage >= 80) return { label: "बेहतरीन / Excellent", color: "success" };
    if (percentage >= 60) return { label: "अच्छा / Good", color: "info" };
    if (percentage >= 40) return { label: "औसत / Average", color: "warning" };
    return { label: "सुधार चाहिए / Needs Improvement", color: "destructive" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-2xl">लोड हो रहा है... / Loading...</div>
      </div>
    );
  }

  if (!district || !currentData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">कोई डेटा उपलब्ध नहीं / No data available</p>
          <Button onClick={() => navigate("/")}>वापस जाएं / Go Back</Button>
        </div>
      </div>
    );
  }

  const performanceStatus = getPerformanceStatus(currentData.payment_completion_percentage);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            वापस / Back
          </Button>
          
          <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-primary/20">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-card-foreground">
              {district.name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg">
                  {monthNames[currentData.month - 1]} {currentData.year}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-full bg-${performanceStatus.color}/10 border-2 border-${performanceStatus.color}`}>
                <span className={`font-semibold text-${performanceStatus.color}`}>
                  {performanceStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="कुल लाभार्थी"
            subtitle="Total Beneficiaries"
            value={formatNumber(currentData.total_beneficiaries)}
            icon={<Users className="w-8 h-8" />}
            color="primary"
          />
          <MetricCard
            title="व्यक्ति-दिवस"
            subtitle="Person-Days"
            value={formatNumber(currentData.person_days_generated)}
            icon={<TrendingUp className="w-8 h-8" />}
            color="success"
          />
          <MetricCard
            title="कुल व्यय"
            subtitle="Total Expenditure"
            value={formatCurrency(currentData.total_wage_outlay)}
            icon={<IndianRupee className="w-8 h-8" />}
            color="accent"
          />
          <MetricCard
            title="कार्य पूर्ण"
            subtitle="Works Completed"
            value={formatNumber(currentData.total_works_completed)}
            icon={<Briefcase className="w-8 h-8" />}
            color="info"
          />
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-2">
            <h3 className="text-lg font-semibold mb-2">औसत मजदूरी / Avg Wage</h3>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(currentData.average_wage_per_day)}/दिन
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-2">
            <h3 className="text-lg font-semibold mb-2">महिला लाभार्थी / Women</h3>
            <p className="text-3xl font-bold text-success">
              {formatNumber(currentData.women_beneficiaries)}
            </p>
            <p className="text-sm text-muted-foreground">
              ({((currentData.women_beneficiaries / currentData.total_beneficiaries) * 100).toFixed(1)}%)
            </p>
          </Card>
          
          <Card className="p-6 bg-card border-2">
            <h3 className="text-lg font-semibold mb-2">चल रहे कार्य / Ongoing</h3>
            <p className="text-3xl font-bold text-info">
              {formatNumber(currentData.total_works_ongoing)}
            </p>
          </Card>
        </div>

        {/* Performance Chart */}
        {performanceData.length > 1 && (
          <Card className="p-6 bg-card border-2">
            <h2 className="text-2xl font-bold mb-6">
              प्रदर्शन रुझान / Performance Trends
            </h2>
            <PerformanceChart data={performanceData} />
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-6 bg-primary/5 border-2 border-primary/20 mt-8">
          <h3 className="text-xl font-bold mb-4">
            MGNREGA के बारे में / About MGNREGA
          </h3>
          <p className="text-base leading-relaxed mb-4">
            महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA) दुनिया के सबसे बड़े कल्याण कार्यक्रमों में से एक है।
          </p>
          <p className="text-base leading-relaxed">
            The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) is one of the world's largest welfare programs,
            providing employment guarantees to rural households.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
