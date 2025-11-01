import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface District {
  id: string;
  name: string;
  code: string;
}

const DistrictSelector = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = districts.filter((district) =>
        district.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts(districts);
    }
  }, [searchQuery, districts]);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, code")
        .order("name");

      if (error) throw error;
      setDistricts(data || []);
      setFilteredDistricts(data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("जिला लोड करने में त्रुटि / Error loading districts");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictSelect = (districtId: string) => {
    navigate(`/dashboard/${districtId}`);
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Find nearest district based on coordinates
          const { data, error } = await supabase
            .from("districts")
            .select("id, name, latitude, longitude")
            .not("latitude", "is", null)
            .not("longitude", "is", null);

          if (error) {
            toast.error("स्थान का पता लगाने में त्रुटि / Error detecting location");
            setDetectingLocation(false);
            return;
          }

          if (data && data.length > 0) {
            // Calculate nearest district (simple distance calculation)
            let nearest = data[0];
            let minDistance = Number.MAX_VALUE;

            data.forEach((district) => {
              if (district.latitude && district.longitude) {
                const distance = Math.sqrt(
                  Math.pow(latitude - parseFloat(district.latitude.toString()), 2) +
                    Math.pow(longitude - parseFloat(district.longitude.toString()), 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearest = district;
                }
              }
            });

            toast.success(`आपका जिला: ${nearest.name} / Your district: ${nearest.name}`);
            navigate(`/dashboard/${nearest.id}`);
          }
          setDetectingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("स्थान की अनुमति दें / Please enable location access");
          setDetectingLocation(false);
        }
      );
    } else {
      toast.error("आपका ब्राउज़र स्थान का समर्थन नहीं करता / Location not supported");
      setDetectingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            हमारी आवाज़, हमारे अधिकार
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-primary">
            Our Voice, Our Rights
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            अपने जिले का MGNREGA प्रदर्शन देखें<br />
            View your district's MGNREGA performance
          </p>
        </div>

        {/* Location Detection Button */}
        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={detectLocation}
            disabled={detectingLocation}
            className="bg-gradient-warm text-white hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-xl shadow-lg"
          >
            <Navigation className="w-6 h-6 mr-3" />
            {detectingLocation ? "पता लगा रहे हैं... / Detecting..." : "मेरा जिला खोजें / Find My District"}
          </Button>
        </div>

        <div className="text-center text-muted-foreground mb-8">
          <p className="text-lg">या / OR</p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
            <Input
              type="text"
              placeholder="अपना जिला खोजें / Search your district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-4 py-6 text-lg rounded-xl border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* District Grid */}
        {loading ? (
          <div className="text-center text-xl">लोड हो रहा है... / Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredDistricts.map((district) => (
              <Card
                key={district.id}
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary bg-card"
                onClick={() => handleDistrictSelect(district.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground">{district.name}</h3>
                    <p className="text-muted-foreground">जिला / District</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredDistricts.length === 0 && !loading && (
          <div className="text-center text-xl text-muted-foreground">
            कोई जिला नहीं मिला / No districts found
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictSelector;
